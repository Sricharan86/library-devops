const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/books', require('./routes/books'));
app.use('/api/members', require('./routes/members'));

module.exports = app;