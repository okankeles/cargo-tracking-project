// services/user-service/index.js
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Database connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Simple table creation logic (for demo purposes)
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

// Endpoint to register a new user
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

// Endpoint to log in a user
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
        
        // !! IMPORTANT: Ask the Auth Service to create a token for us
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
    createTable();
});