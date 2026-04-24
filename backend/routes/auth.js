const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'garageiq_super_secret_2024';
const JWT_EXPIRES = '7d';


// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required.'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    // Secure password comparison
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({
      error: 'Server error during login.'
    });
  }
});


// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Name, email and password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters.'
    });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    // Secure password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, hashedPassword, 'user']
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        email: cleanEmail,
        name: cleanName,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: 'user'
      }
    });

  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({
      error: 'Server error during registration.'
    });
  }
});


// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Token Verification Error:', err.message);
    res.status(403).json({
      error: 'Invalid token.'
    });
  }
});

module.exports = router;
