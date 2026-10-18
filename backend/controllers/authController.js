// controllers/authController.js
// Purpose: Handles secure user registration, login, and profile lookup using bcrypt & JWT.
// Connects to MySQL 'users' table in foodrescue_db.

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function: Generate signed JWT token valid for 7 days
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'foodrescue_jwt_secret',
    { expiresIn: '7d' }
  );
};

// Email validation helper using standard RFC 5322 regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ── 1. POST /api/auth/register ───────────────────────────────────────
// Purpose: Registers a new donor or NGO account with hashed password
const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    // 1. Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password, and role are required fields.' });
    }

    // 2. Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address (e.g., user@example.com).' });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // 4. Enforce role restriction: Public users may ONLY register as 'donor' or 'ngo'
    // Admin accounts must be created through a secure administrative process.
    if (role.toLowerCase() === 'admin') {
      return res.status(403).json({
        message: 'Admin accounts cannot be registered publicly. They must be created through a secure administrative process.',
      });
    }

    const normalizedRole = role.toLowerCase().trim();
    if (normalizedRole !== 'donor' && normalizedRole !== 'ngo') {
      return res.status(400).json({
        message: 'Invalid role specified. Public registration only allows "donor" or "ngo" accounts.',
      });
    }

    // 5. Check for duplicate email in MySQL
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // 6. Hash password using bcrypt with 10 salt rounds (never store plain text)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 7. Insert the new user into the MySQL users table
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash, normalizedRole]
    );

    // 8. Generate JWT token for immediate login
    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: normalizedRole,
    };
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful! Welcome to FoodRescue.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
};

// ── 2. POST /api/auth/login ──────────────────────────────────────────
// Purpose: Authenticates a user with email & password, returns JWT token
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // 3. Find user in MySQL database
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // 4. Compare entered plain-text password with stored bcrypt hash
    const storedHash = user.password_hash || user.password;
    const isPasswordMatch = await bcrypt.compare(password, storedHash);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 5. Generate secure JWT token
    const token = generateToken(user);

    // 6. Return token and sanitized user profile (omit password hash)
    res.json({
      message: 'Login successful!',
      token,
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
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
};

// ── 3. GET /api/auth/me ──────────────────────────────────────────────
// Purpose: Returns current authenticated user profile using token from req.user
const getMe = async (req, res) => {
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
};

module.exports = { register, login, getMe };
