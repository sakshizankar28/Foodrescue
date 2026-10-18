// authRoutes.js - Routes for user authentication
// Maps HTTP methods and paths to controller functions

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register - Create a new account
router.post('/register', register);

// POST /api/auth/login - Log in with email and password
router.post('/login', login);

// GET /api/auth/me - Get logged-in user's profile (requires token)
router.get('/me', protect, getMe);

module.exports = router;
