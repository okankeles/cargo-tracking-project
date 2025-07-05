const express = require('express');
const jwt = require('jsonwebtoken');
const client = require('prom-client'); // Prometheus client

const app = express();

// --- Prometheus Metrik Kurulumu ---
const register = new client.Registry();
register.setDefaultLabels({
  app: 'auth-service'
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

const JWT_SECRET = 'a-very-strong-and-secret-key';

app.post('/token', (req, res) => {
    const { userId, email } = req.body;
    if (!userId || !email) {
        return res.status(400).json({ error: 'User ID and email are required.' });
    }
    
    const payload = { userId, email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});