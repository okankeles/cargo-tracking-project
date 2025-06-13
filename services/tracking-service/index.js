// services/tracking-service/index.js
const express = require('express');
const verifyToken = require('./verifyToken'); // Token doğrulama middleware'ini import ediyoruz

const app = express();
app.use(express.json());

// Bu endpoint, herkesin erişebileceği, korunmayan bir endpoint'tir.
app.get('/public', (req, res) => {
    res.json({ message: 'This is a public endpoint. Anyone can see this!' });
});

// Bu endpoint, verifyToken middleware'i tarafından korunmaktadır.
// Sadece geçerli bir token ile erişilebilir.
app.get('/shipments/:trackingId', verifyToken, (req, res) => {
    const { trackingId } = req.params;
    
    // Middleware başarılı olursa, req.user objesi token'dan gelen bilgileri içerir.
    const user = req.user; 

    // Şimdilik sahte veri döndürüyoruz.
    // Veritabanı entegrasyonu sonraki adımlarda yapılabilir.
    res.json({
        message: `Shipment details for user: ${user.email}`,
        trackingId: trackingId,
        status: 'In Transit',
        location: 'Istanbul Hub'
    });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Tracking Service running on port ${PORT}`);
});