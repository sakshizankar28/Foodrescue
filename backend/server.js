// server.js - Main entry point for the FoodRescue backend
// Starts the Express server, connects routes, and serves uploaded food photos

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import route files
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────
// Enable CORS so the React frontend (on port 5173) can talk to this server
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Parse incoming JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ──────────────────────────────────────────────────
// Serve uploaded food images from backend/uploads so React can load them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);       // /api/auth/register, /api/auth/login
app.use('/api/food', foodRoutes);       // /api/food, /api/food/:id
app.use('/api/requests', requestRoutes); // /api/requests/mine, /api/requests/incoming

// ── Health check route ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🌱 FoodRescue API is running' });
});

// ── Multer & General Error Handling Middleware ────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large! Maximum allowed size is 5MB.' });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
