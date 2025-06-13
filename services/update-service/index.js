// services/update-service/index.js
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://rabbitmq'; // Docker Compose'daki servis adı
const EXCHANGE_NAME = 'shipment_events';

let channel; // RabbitMQ kanalını global olarak tutuyoruz

// RabbitMQ'ya bağlan ve bir kanal oluştur
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        // 'fanout' tipi exchange, kendisine gelen mesajı bağlı tüm kuyruklara ayrım yapmadan gönderir.
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
        console.log('Connected to RabbitMQ and exchange is ready.');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        // Başarısız olursa 5 saniye sonra tekrar dene
        setTimeout(connectRabbitMQ, 5000);
    }
}

// Bu endpoint, bir kargo durum güncellemesini simüle eder
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
    
    // Mesajı exchange'e yayınla.
    // Buffer.from ile string'i binary veriye çeviriyoruz.
    channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify(message)));

    console.log(`Published event: Shipment ${trackingId} is now ${status}`);
    res.status(202).json({ message: 'Status update event has been published.' });
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Update Service running on port ${PORT}`);
    connectRabbitMQ();
});