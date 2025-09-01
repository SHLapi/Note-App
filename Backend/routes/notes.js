const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');


const jwtSecret = process.env.JWT;

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};


// Save notes route
router.post('/save', auth, async (req, res) => {
  try {
    const user = req.user;
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
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const decryptedNotes = user.getDecryptedNotes();
    res.status(200).json({ notes: decryptedNotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;