const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

const query = (sql, params) => new Promise((resolve, reject) => {
    pool.execute(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
    });
});

// ====================== LOGIN ======================
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0 || users[0].password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ====================== PROPERTY RECORDS ======================
app.get('/api/property-records', async (req, res) => {
    const [rows] = await query('SELECT * FROM property_records ORDER BY created_at DESC');
    res.json(rows);
});

app.post('/api/property-records', async (req, res) => {
    const { owner_name, lot_number, title_number, location, transaction_type, status, created_at } = req.body;
    const [result] = await query(
        'INSERT INTO property_records (owner_name, lot_number, title_number, location, transaction_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [owner_name, lot_number, title_number, location, transaction_type, status, created_at]
    );
    const [newRecord] = await query('SELECT * FROM property_records WHERE id = ?', [result.insertId]);
    res.json(newRecord);
});

app.put('/api/property-records/:id', async (req, res) => {
    const { id } = req.params;
    const { owner_name, lot_number, title_number, location, transaction_type, status, created_at } = req.body;
    await query(
        'UPDATE property_records SET owner_name=?, lot_number=?, title_number=?, location=?, transaction_type=?, status=?, created_at=? WHERE id=?',
        [owner_name, lot_number, title_number, location, transaction_type, status, created_at, id]
    );
    const [updated] = await query('SELECT * FROM property_records WHERE id = ?', [id]);
    res.json(updated);
});

app.delete('/api/property-records/:id', async (req, res) => {
    await query('DELETE FROM property_records WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

// ====================== TRANSACTIONS ======================
app.get('/api/transactions', async (req, res) => {
    const [rows] = await query('SELECT * FROM transactions ORDER BY received_date DESC');
    res.json(rows);
});

app.post('/api/transactions', async (req, res) => {
    const { owner_name, received_date, released_date, action_taken, status } = req.body;
    const [result] = await query(
        'INSERT INTO transactions (owner_name, received_date, released_date, action_taken, status) VALUES (?, ?, ?, ?, ?)',
        [owner_name, received_date, released_date, action_taken, status]
    );
    const [newRecord] = await query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.json(newRecord);
});

app.put('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { owner_name, received_date, released_date, action_taken, status } = req.body;
    await query(
        'UPDATE transactions SET owner_name=?, received_date=?, released_date=?, action_taken=?, status=? WHERE id=?',
        [owner_name, received_date, released_date, action_taken, status, id]
    );
    const [updated] = await query('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json(updated);
});

app.delete('/api/transactions/:id', async (req, res) => {
    await query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

// ====================== TAX MAPPINGS ======================
app.get('/api/tax-mappings', async (req, res) => {
    const [rows] = await query('SELECT * FROM tax_mappings ORDER BY received_date DESC');
    res.json(rows);
});

app.post('/api/tax-mappings', async (req, res) => {
    const { owner_name, lot_number, received_date, released_date, status } = req.body;
    const [result] = await query(
        'INSERT INTO tax_mappings (owner_name, lot_number, received_date, released_date, status) VALUES (?, ?, ?, ?, ?)',
        [owner_name, lot_number, received_date, released_date, status]
    );
    const [newRecord] = await query('SELECT * FROM tax_mappings WHERE id = ?', [result.insertId]);
    res.json(newRecord);
});

app.put('/api/tax-mappings/:id', async (req, res) => {
    const { id } = req.params;
    const { owner_name, lot_number, received_date, released_date, status } = req.body;
    await query(
        'UPDATE tax_mappings SET owner_name=?, lot_number=?, received_date=?, released_date=?, status=? WHERE id=?',
        [owner_name, lot_number, received_date, released_date, status, id]
    );
    const [updated] = await query('SELECT * FROM tax_mappings WHERE id = ?', [id]);
    res.json(updated);
});

app.delete('/api/tax-mappings/:id', async (req, res) => {
    await query('DELETE FROM tax_mappings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Municipal Assessor Server running on http://localhost:${PORT}`);
});