const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Binoza2610', // Sesuaikan password kamu
  database: 'apikeys'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal konek ke database:', err);
    return;
  }
  console.log('✅ Terhubung ke MySQL!');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTE HALAMAN HTML ---
// Page 1: Home (Form User)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page 2: Admin Login/Register
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Page 3: Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// --- API ENDPOINTS ---

// 1. Generate API Key saja (untuk dikirim ke frontend)
app.get('/api/generate', (req, res) => {
  const newKey = crypto.randomBytes(16).toString('hex');
  res.json({ apiKey: newKey });
});

// 2. Simpan Data User & API Key (Page 1)
app.post('/api/users', (req, res) => {
  const { firstName, lastName, email, apiKey } = req.body;
  const sql = 'INSERT INTO users (first_name, last_name, email, api_key) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [firstName, lastName, email, apiKey], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Data berhasil disimpan!' });
  });
});

// 3. Ambil Semua Data untuk Dashboard (Page 3)
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal mengambil data' });
    }
    res.json(results);
  });
});

// 4. Hapus Data (Button Delete di Dashboard)
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server jalan di http://localhost:${port}`);
});