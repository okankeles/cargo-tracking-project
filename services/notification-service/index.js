// services/notification-service/index.js
const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://rabbitmq';
const EXCHANGE_NAME = 'shipment_events';

async function startWorker() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });

        // Geçici ve isimsiz bir kuyruk oluştur.
        // exclusive: true -> bu bağlantı kapandığında kuyruk silinir.
        const q = await channel.assertQueue('', { exclusive: true });
        console.log(`[*] Waiting for messages in queue: ${q.queue}. To exit press CTRL+C`);

        // Kuyruğu exchange'e bağla. Artık bu exchange'e gelen tüm mesajlar bu kuyruğa da gelecek.
        channel.bindQueue(q.queue, EXCHANGE_NAME, '');

        // Kuyruktan mesajları tüketmeye başla
        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const event = JSON.parse(msg.content.toString());
                console.log("-----------------------------------------");
                console.log("📬 [Received Event] A shipment status has changed!");
                console.log(`   -> Tracking ID: ${event.trackingId}`);
                console.log(`   -> New Status: ${event.status}`);
                console.log("   -> Action: Sending email notification... (simulated)");
                console.log("-----------------------------------------");
            }
        }, {
            noAck: true // noAck: true -> mesajı alır almaz kuyruktan sil (basit senaryolar için)
        });

    } catch (error) {
        console.error('Failed to connect or start worker:', error);
        setTimeout(startWorker, 5000);
    }
}

startWorker();