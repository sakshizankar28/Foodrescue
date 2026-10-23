// routes/authRoutes.js
// Handles user registration, login, profile retrieval, and profile updates with bcrypt & JWT.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Helper: Generate signed JWT token valid for 7 days
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'foodrescue_jwt_secret',
    { expiresIn: '7d' }
  );
};

// Helper: RFC 5322 email regex check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── 1. POST /api/auth/register ───────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password, and role are required fields.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedRole = role.toLowerCase().trim();
    if (normalizedRole === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be registered publicly.' });
    }

    if (normalizedRole !== 'donor' && normalizedRole !== 'ngo') {
      return res.status(400).json({ message: 'Invalid role. Public registration only allows "donor" or "ngo".' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash, normalizedRole]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: normalizedRole,
    };

    res.status(201).json({
      message: 'Registration successful! Welcome to FoodRescue.',
      token: generateToken(newUser),
      user: newUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ── 2. POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash || user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ── 3. GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── 4. PUT /api/auth/profile ─────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  const { name, phone } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    await db.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name.trim(), phone ? phone.trim() : null, req.user.id]
    );

    const [users] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'Profile updated successfully!',
      user: users[0],
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
});

module.exports = router;
