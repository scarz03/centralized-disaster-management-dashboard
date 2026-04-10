// ================= BACKEND (Node.js + Express + SQLite) =================

// 1. Install dependencies:
// npm init -y
// npm install express sqlite3 cors body-parser

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 2. Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

// 3. Create tables

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)`);


db.run(`CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  location TEXT,
  description TEXT,
  pincode TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 4. Routes

// Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
    if (err) return res.status(500).send(err);
    res.send({ message: 'User registered' });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).send(err);
    if (!row) return res.status(401).send({ message: 'Invalid credentials' });
    res.send({ message: 'Login successful' });
  });
});

// Add alert
app.post('/alerts', (req, res) => {
  const { type, location, description, pincode } = req.body;
  db.run(`INSERT INTO alerts (type, location, description, pincode) VALUES (?, ?, ?, ?)`, [type, location, description, pincode], function(err) {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Alert added' });
  });
});

// Get alerts
app.get('/alerts', (req, res) => {
  db.all(`SELECT * FROM alerts ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.send(rows);
  });
});

app.delete('/alerts/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM alerts WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Alert deleted' });
  });
});

app.get('/create-user', (req, res) => {
  console.log("Create-user route hit");

  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    ['admin', '1234'],
    function(err) {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).send(err.message);
      }

      console.log("User inserted");
      res.send("User created successfully");
    }
  );
});



const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
});


