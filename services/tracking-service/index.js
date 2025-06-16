const express = require('express');
const { Pool } = require('pg');
const checkToken = require('./checkToken');
const client = require('prom-client');

const app = express();

// --- Prometheus Metrik Kurulumu ---
const register = new client.Registry();
register.setDefaultLabels({
  app: 'tracking-service'
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

// --- VERİTABANI BAĞLANTISI VE KURULUMU ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'postgres_db', // Docker Compose'daki veritabanı servis adı
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const setupDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS shipments (
                id SERIAL PRIMARY KEY,
                tracking_id VARCHAR(50) UNIQUE NOT NULL,
                status VARCHAR(50),
                current_location VARCHAR(100),
                recipient_name VARCHAR(100),
                recipient_address TEXT,
                shipper VARCHAR(100),
                estimated_delivery DATE,
                user_id INTEGER REFERENCES users(id) -- Bu kargonun hangi kullanıcıya ait olduğunu belirtir
            );
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS shipment_events (
                id SERIAL PRIMARY KEY,
                shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
                timestamp TIMESTAMPTZ,
                location VARCHAR(100),
                description TEXT
            );
        `);
        console.log("Shipment tables are ready.");

        // Başlangıç verisi var mı diye kontrol et, yoksa ekle
        const { rows } = await pool.query('SELECT COUNT(*) FROM shipments');
        if (rows[0].count === '0') {
            console.log('Seeding initial shipment data...');
            // 1. Kargo: Belirli bir kullanıcıya ait (user_id = 1)
            const shipment1 = await pool.query(
                `INSERT INTO shipments (tracking_id, status, current_location, recipient_name, recipient_address, shipper, estimated_delivery, user_id)
                 VALUES ('USER123', 'Delivered', 'Izmir, Bornova Office', 'Birol Çiloğlugil', 'Ege University Campus', 'MS-CARGO Express', '2025-05-25', 1)
                 RETURNING id`
            );
            await pool.query(
                `INSERT INTO shipment_events (shipment_id, timestamp, location, description) VALUES
                 ($1, '2025-05-25 14:30:00+03', 'Izmir, Bornova', 'Successfully delivered.'),
                 ($1, '2025-05-25 09:15:00+03', 'Izmir, Bornova', 'Out for delivery.')`,
                [shipment1.rows[0].id]
            );

            // 2. Kargo: Herkese açık (user_id = NULL)
            const shipment2 = await pool.query(
                `INSERT INTO shipments (tracking_id, status, current_location, recipient_name, recipient_address, shipper, estimated_delivery)
                 VALUES ('PUBLIC123', 'In Transit', 'Ankara Hub', 'Okan Keleş', 'Bilkent University Campus', 'MS-CARGO Express', '2025-05-28')
                 RETURNING id`
            );
            await pool.query(
                `INSERT INTO shipment_events (shipment_id, timestamp, location, description) VALUES
                 ($1, '2025-05-27 18:45:00+03', 'Ankara Hub', 'Departed from facility.'),
                 ($1, '2025-05-26 11:00:00+03', 'Ankara Hub', 'Package received by carrier.')`,
                [shipment2.rows[0].id]
            );
            console.log('Initial data seeded.');
        }

    } catch (err) {
        console.error('Database setup failed:', err);
    }
};
// --- VERİTABANI KURULUMU BİTİŞİ ---

// Bu endpoint'i test amaçlı veya başka bir nedenle tutabilirsiniz.
app.get('/public', (req, res) => {
    res.json({ message: 'This is a public endpoint. Anyone can see this!' });
});

// --- Kargo Takip Endpoint'i ---
app.get('/shipments/:trackingId', checkToken, async (req, res) => {
    const { trackingId } = req.params;
    const user = req.user;

    try {
        const shipmentRes = await pool.query('SELECT * FROM shipments WHERE tracking_id = $1', [trackingId]);

        if (shipmentRes.rows.length === 0) {
            return res.status(404).json({ error: `Shipment with tracking ID '${trackingId}' not found.` });
        }

        const shipment = shipmentRes.rows[0];
        
        // Eğer kullanıcı giriş yapmışsa VE (kargo o kullanıcıya aitse VEYA kargo herkese açıksa)
        if (user && (shipment.user_id === user.userId || shipment.user_id === null)) {
            const eventsRes = await pool.query(
                'SELECT TO_CHAR(timestamp, \'DD/MM/YYYY HH24:MI\') as timestamp, location, description FROM shipment_events WHERE shipment_id = $1 ORDER BY timestamp DESC',
                [shipment.id]
            );
            
            res.json({
                trackingId: shipment.tracking_id,
                status: shipment.status,
                location: shipment.current_location,
                recipient: shipment.recipient_name,
                address: shipment.recipient_address,
                shipper: shipment.shipper,
                estimated_delivery: shipment.estimated_delivery,
                events: eventsRes.rows,
            });
        } else {
            // Diğer tüm durumlar (giriş yapmamış veya kargo sahibi olmayan)
            res.json({
                trackingId: shipment.tracking_id,
                status: shipment.status,
                location: shipment.current_location
            });
        }
    } catch (err) {
        console.error('Error fetching shipment:', err);
        res.status(500).json({ error: 'Internal server error' });
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

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Tracking Service running on port ${PORT}`);
    setupDatabase(); // Servis başladığında veritabanı kurulumunu çalıştır
});