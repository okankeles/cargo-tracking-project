// services/auth-service/index.js
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = 'a-very-strong-and-secret-key'; // In a real app, use environment variables!

app.post('/token', (req, res) => {
    const { userId, email } = req.body;
    if (!userId || !email) {
        return res.status(400).json({ error: 'User ID and email are required.' });
    }
    
    const payload = { userId, email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    res.json({ token });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});