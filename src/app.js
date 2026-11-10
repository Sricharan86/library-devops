const express = require('express');
const cors = require('cors');
const path = require('path');
const client = require('prom-client');

const app = express();
client.collectDefaultMetrics();

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: String(res.statusCode)
    });
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/api/books', require('./routes/books'));
app.use('/api/members', require('./routes/members'));
app.use('/api', require('./routes/circulation'));

module.exports = app;
