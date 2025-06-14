const express = require('express');
const amqp = require('amqplib');
const client = require('prom-client'); // Prometheus client

const app = express();

// --- Prometheus Metrik Kurulumu ---
const register = new client.Registry();
register.setDefaultLabels({
  app: 'update-service'
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

const RABBITMQ_URL = 'amqp://rabbitmq';
const EXCHANGE_NAME = 'shipment_events';

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
        console.log('Connected to RabbitMQ and exchange is ready.');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
}

app.post('/update-status', (req, res) => {
    const { trackingId, status } = req.body;

    if (!trackingId || !status) {
        return res.status(400).json({ error: 'trackingId and status are required.' });
    }
    if (!channel) {
        return res.status(503).json({ error: 'RabbitMQ connection not established yet.' });
    }

    const message = {
        trackingId,
        status,
        updatedAt: new Date()
    };
    
    channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify(message)));

    console.log(`Published event: Shipment ${trackingId} is now ${status}`);
    res.status(202).json({ message: 'Status update event has been published.' });
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

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Update Service running on port ${PORT}`);
    connectRabbitMQ();
});