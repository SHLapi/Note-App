const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');


// Save notes route
router.post('/save', async (req, res) => {
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
router.get('/', async (req, res) => {
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