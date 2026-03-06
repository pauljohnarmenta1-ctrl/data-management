const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'johnpaul#6101',
  database: 'assessor_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Property Records Endpoints
app.get('/api/property-records', (req, res) => {
  pool.query('SELECT * FROM property_records ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/property-records', (req, res) => {
  const data = req.body;
  pool.query('INSERT INTO property_records SET ?', data, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...data });
  });
});

app.put('/api/property-records/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  pool.query('UPDATE property_records SET ? WHERE id = ?', [data, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ...data, id });
  });
});

app.delete('/api/property-records/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM property_records WHERE id = ?', id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Transactions Endpoints (similar structure)
app.get('/api/transactions', (req, res) => {
  pool.query('SELECT * FROM transactions ORDER BY received_date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/transactions', (req, res) => {
  const data = req.body;
  pool.query('INSERT INTO transactions SET ?', data, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...data });
  });
});

app.put('/api/transactions/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  pool.query('UPDATE transactions SET ? WHERE id = ?', [data, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ...data, id });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM transactions WHERE id = ?', id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Tax Mappings Endpoints (similar structure)
app.get('/api/tax-mappings', (req, res) => {
  pool.query('SELECT * FROM tax_mappings ORDER BY received_date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/tax-mappings', (req, res) => {
  const data = req.body;
  pool.query('INSERT INTO tax_mappings SET ?', data, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...data });
  });
});

app.put('/api/tax-mappings/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  pool.query('UPDATE tax_mappings SET ? WHERE id = ?', [data, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ...data, id });
  });
});

app.delete('/api/tax-mappings/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM tax_mappings WHERE id = ?', id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Login Endpoint (simple; enhance with auth in production)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});