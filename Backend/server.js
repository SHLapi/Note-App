const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
dotenv.config();
const notesRoutes = require('./routes/notes');


const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());


// Connect to MongoDB
mongoose.connect(process.env.DB_URL)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


app.use('/api/notes', notesRoutes);


// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Serve static front-end files
app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT} `));