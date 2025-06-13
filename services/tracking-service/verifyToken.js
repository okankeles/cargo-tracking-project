// services/tracking-service/verifyToken.js
const jwt = require('jsonwebtoken');

// Hatırlatma: Bu anahtar, auth-service'teki ile birebir aynı olmalıdır!
const JWT_SECRET = 'a-very-strong-and-secret-key';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: 'No token provided.' });
    }

    // Token genellikle "Bearer <token>" formatında gelir. Sadece token kısmını alıyoruz.
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ error: 'Malformed token.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token.' });
        }

        // Token geçerliyse, token'ın içindeki bilgileri (payload) isteğe ekliyoruz.
        // Böylece sonraki adımlarda bu bilgilere erişilebilir.
        req.user = decoded;
        next(); // Her şey yolundaysa, bir sonraki adıma (asıl endpoint'e) geç.
    });
}

module.exports = verifyToken;