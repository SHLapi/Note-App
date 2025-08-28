const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT;

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded.userId;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Save notes route
router.post('/save', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.notes = req.body.notes;
    await user.save();
    res.status(200).json({ message: 'Notes saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch notes route
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ notes: user.notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;