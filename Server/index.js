// server.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(bodyParser.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
