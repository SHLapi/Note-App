const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  to: 'shalabi.70.a@gmail.com',
  subject: 'Test Email',
  html: 'This is a test email.',
}).then(() => console.log('Email sent')).catch(err => console.error('Email error:', err));