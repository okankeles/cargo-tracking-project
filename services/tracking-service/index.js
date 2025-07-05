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
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000, // Bağlantı denemesi için zaman aşımı
});

const setupDatabase = async () => {
    // Bu fonksiyon sadece tabloları oluşturur ve başlangıç verisini ekler.
    // Bağlantı kontrolü dışarıda yapılır.
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
            user_id INTEGER REFERENCES users(id)
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

    const { rows } = await pool.query('SELECT COUNT(*) FROM shipments');
    if (parseInt(rows[0].count, 10) > 0) {
        console.log('Database already contains shipment data. Seeding skipped.');
        return;
    }

    console.log('Seeding initial rich shipment data...');
    const shipmentsData = [
        { trackingId: 'MS-UK-001', status: 'Delivered', location: 'London, UK', recipient: 'Alex Williams', address: '221B Baker Street, London', shipper: 'MS-CARGO Express', estDelivery: '2025-06-10', userId: null },
        { trackingId: 'MS-RU-002', status: 'In Transit', location: 'Moscow Sorting Center', recipient: 'Sasha Petrova', address: '1 Red Square, Moscow', shipper: 'MS-CARGO Standard', estDelivery: '2025-06-20', userId: null },
        { trackingId: 'MS-JP-003', status: 'Customs Clearance', location: 'Tokyo Customs', recipient: 'Kenji Tanaka', address: '1-1 Chiyoda, Tokyo', shipper: 'MS-CARGO International', estDelivery: '2025-06-22', userId: null },
        { trackingId: 'MS-DE-004', status: 'Delivered', location: 'Berlin, Germany', recipient: 'Klaus Mueller', address: 'Brandenburg Gate, Berlin', shipper: 'MS-CARGO Express', estDelivery: '2025-06-12', userId: null },
        { trackingId: 'MS-FR-005', status: 'Exception', location: 'Paris, France', recipient: 'Amélie Dubois', address: 'Eiffel Tower, Paris', shipper: 'MS-CARGO Standard', estDelivery: '2025-06-18', userId: null },
        { trackingId: 'MS-CA-006', status: 'In Transit', location: 'Toronto, Canada', recipient: 'John Smith', address: '100 CN Tower, Toronto', shipper: 'MS-CARGO International', estDelivery: '2025-06-25', userId: null },
        { trackingId: 'MS-AU-007', status: 'Delivered', location: 'Sydney, Australia', recipient: 'Jane Doe', address: '1 Opera House, Sydney', shipper: 'MS-CARGO Express', estDelivery: '2025-06-15', userId: null },
        { trackingId: 'MS-BR-008', status: 'In Transit', location: 'Rio de Janeiro, Brazil', recipient: 'Carlos Silva', address: '10 Christ the Redeemer, Rio', shipper: 'MS-CARGO Standard', estDelivery: '2025-06-28', userId: null },
        { trackingId: 'MS-IN-009', status: 'Customs Clearance', location: 'Mumbai Customs, India', recipient: 'Priya Sharma', address: '1 Taj Mahal Palace, Mumbai', shipper: 'MS-CARGO International', estDelivery: '2025-06-30', userId: null },
        { trackingId: 'MS-CN-010', status: 'Delivered', location: 'Beijing, China', recipient: 'Li Wei', address: '1 Forbidden City, Beijing', shipper: 'MS-CARGO Express', estDelivery: '2025-06-18', userId: null },
        { trackingId: 'MS-ZA-011', status: 'In Transit', location: 'Johannesburg, South Africa', recipient: 'Nelson Mandla', address: '1 Table Mountain, Cape Town', shipper: 'MS-CARGO Standard', estDelivery: '2025-07-02', userId: null },
        { trackingId: 'MS-MX-012', status: 'Exception', location: 'Mexico City, Mexico', recipient: 'Maria Hernandez', address: '1 Zocalo, Mexico City', shipper: 'MS-CARGO International', estDelivery: '2025-07-05', userId: null },
        { trackingId: 'MS-IT-013', status: 'Delivered', location: 'Rome, Italy', recipient: 'Giovanni Rossi', address: '1 Colosseum, Rome', shipper: 'MS-CARGO Express', estDelivery: '2025-06-20', userId: null },
        { trackingId: 'MS-ES-014', status: 'In Transit', location: 'Madrid, Spain', recipient: 'Javier Garcia', address: '1 Prado Museum, Madrid', shipper: 'MS-CARGO Standard', estDelivery: '2025-07-08', userId: null },
        { trackingId: 'MS-EG-015', status: 'Customs Clearance', location: 'Cairo Customs, Egypt', recipient: 'Fatima Al-Sayed', address: '1 Pyramids of Giza, Cairo', shipper: 'MS-CARGO International', estDelivery: '2025-07-10', userId: null },
    ];
    const eventTemplates = [ { desc: 'Package received by carrier.' }, { desc: 'Departed from facility.' }, { desc: 'Arrived at sorting center.' }, { desc: 'Customs clearance started.' }, { desc: 'Out for delivery.' }, { desc: 'Successfully delivered.' }, { desc: 'Delivery attempt failed. Address issue.' } ];

    for (const s of shipmentsData) {
        const shipmentRes = await pool.query( `INSERT INTO shipments (tracking_id, status, current_location, recipient_name, recipient_address, shipper, estimated_delivery, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [s.trackingId, s.status, s.location, s.recipient, s.address, s.shipper, s.estDelivery, s.userId] );
        const shipmentId = shipmentRes.rows[0].id;
        const eventCount = Math.floor(Math.random() * 2) + 2;
        for (let j = 0; j < eventCount; j++) {
            const event = eventTemplates[j];
            const eventTimestamp = new Date(s.estDelivery);
            eventTimestamp.setDate(eventTimestamp.getDate() - (eventCount - j));
            await pool.query( `INSERT INTO shipment_events (shipment_id, timestamp, location, description) VALUES ($1, $2, $3, $4)`, [shipmentId, eventTimestamp, s.location, event.desc] );
        }
    }
    console.log('15 shipments seeded successfully.');
};

async function initializeDatabaseWithRetry(retries = 5, delay = 5000) {
    for (let i = 1; i <= retries; i++) {
        try {
            await pool.query('SELECT 1');
            console.log('Database connection successful.');
            await setupDatabase();
            return;
        } catch (err) {
            console.log(`Database connection attempt ${i} failed. Retrying in ${delay / 1000}s...`);
            if (i === retries) {
                console.error('Could not connect to the database after multiple retries. Exiting.');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
}
// --- VERİTABANI KURULUMU BİTİŞİ ---

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
        if (user && (shipment.user_id === user.userId || shipment.user_id === null)) {
            const eventsRes = await pool.query( 'SELECT TO_CHAR(timestamp, \'DD/MM/YYYY HH24:MI\') as timestamp, location, description FROM shipment_events WHERE shipment_id = $1 ORDER BY timestamp DESC', [shipment.id] );
            res.json({
                trackingId: shipment.tracking_id, status: shipment.status, location: shipment.current_location,
                recipient: shipment.recipient_name, address: shipment.recipient_address, shipper: shipment.shipper,
                estimated_delivery: shipment.estimated_delivery, events: eventsRes.rows,
            });
        } else {
            res.json({ trackingId: shipment.tracking_id, status: shipment.status, location: shipment.current_location });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tracking Service running on port ${PORT}`);
    initializeDatabaseWithRetry();
});
