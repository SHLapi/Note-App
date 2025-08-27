const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// A dummy secret for JWT. In a real app, use a long, random string from a .env file.
const jwtSecret = process.env.JWT;

// Sign-up Route
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = new User({ username, password, notes: [] });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token , theme: user.theme});
});




router.post('/theme', async (req, res) => {
    const { theme } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        await User.findByIdAndUpdate(decoded.userId, { theme });
        res.json({ message: 'Theme updated successfully' });
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

module.exports = router;