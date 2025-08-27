const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
mongoose.connect(process.env.DB_URL)
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error('Could not connect to MongoDB...', err));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use(express.static('public'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));