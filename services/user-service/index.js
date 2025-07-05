const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const client = require('prom-client');

const app = express();

// --- Prometheus Metrik Kurulumu ---
const register = new client.Registry();
register.setDefaultLabels({
  app: 'user-service'
});
client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500, 750, 1000]
});
register.registerMetric(httpRequestDurationMicroseconds);
// --- Prometheus Metrik Kurulumu Bitişi ---

app.use(express.json());

// --- Prometheus Middleware ---
app.use((req, res, next) => {
    if (req.path === '/metrics') {
        return next();
    }
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ route: req.route ? req.route.path : req.path, code: res.statusCode, method: req.method });
    });
    next();
});
// --- Prometheus Middleware Bitişi ---

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const createTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
    `);
    console.log("Users table is ready.");
};

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User could not be registered.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        const tokenResponse = await fetch('http://auth-service:3001/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: user.email })
        });

        const { token } = await tokenResponse.json();
        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Prometheus /metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Service running on port ${PORT}`);
    createTable();
});
