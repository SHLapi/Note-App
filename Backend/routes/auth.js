const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


const jwtSecret = process.env.JWT;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Sign-up Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Basic input validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields (username, email, password) are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (/\s/.test(username)) {
        return res.status(400).json({ error: 'Username cannot contain spaces' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }
    if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'user') {
        return res.status(400).json({ error: 'This username is reserved. Please choose another one.' });
    }
    if (password.toLowerCase().includes(username.toLowerCase()) || username.toLowerCase().includes(password.toLowerCase())) {
        return res.status(400).json({ error: 'Password should not contain the username' });
    }


    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existingUser) {
        if (existingUser.username === username) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        if (existingUser.email === email.toLowerCase()) {
            return res.status(400).json({ error: 'Email already registered' });
        }
    }


    try {
        let user = new User({ username, email: email.toLowerCase(), password, notes: [], theme: 'dark' });
        user.verificationToken = user.generateVerificationToken();
        await user.save();

        // Send verification email
        const verificationUrl = `http://localhost:5000/api/auth/verify/${user.verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Verify Your Email',
            html: `Please click <a href="${verificationUrl}">here</a> to verify your email.`
        });

        res.status(201).json({ message: 'User created successfully. Please check your email to verify.' });
    } catch (err) {
        if (err.code === 11000) { 
            const field = Object.keys(err.keyValue)[0];
            res.status(400).json({ error: `${field} already exists` });
        } else {
            console.error('Signup error:', err);
            res.status(500).json({ error: 'Server error during signup' });
        }
    }
});
// Email Verification Route
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.redirect('/login.html');
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier (username or email) and password are required' });
    }

    const user = await User.findOne({ 
        $or: [{ username: identifier },{ email: identifier.toLowerCase() }
        ]
    });
    if (!user) {
        return res.status(400).json({ error: 'Username not Registered' });
    }
    if (!user.isVerified) {
    return res.status(400).json({ error: 'Please verify your email before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Username or Password is not Correct' });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token , theme: user.theme});
});

//forget password route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Email not registered' });
        }
        const resetToken = user.generateResetPasswordToken();
        await user.save();
        const resetUrl = `http://localhost:5000/reset-password.html?token=${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Reset Your Password',
            html: `Please click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.`
        });
    res.json({ message: 'Password reset link sent to your email' });
    } catch (err) {
    res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({ 
            resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
    res.json({ message: 'Password reset successfully' });
    } catch (err) {
    res.status(500).json({ error: 'Server error' });
    }
});

// Theme update route
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