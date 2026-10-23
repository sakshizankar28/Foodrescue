// server.js - Unified entry point for the FoodRescue application
// Serves both the Express REST APIs and the React frontend on a single origin (http://localhost:3000)

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import route files
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');

// ── Middleware ────────────────────────────────────────────────────
// Permissive CORS for development or same-origin requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or same-origin browser requests)
      if (!origin) return callback(null, true);
      const allowed = [
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
      ].filter(Boolean);
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all local dev origins
    },
    credentials: true,
  })
);

// Parse incoming JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ──────────────────────────────────────────────────
// 1. Serve uploaded food images from backend/uploads
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 2. Serve built React frontend static assets from frontend/dist
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// ── API Routes ────────────────────────────────────────────────────
// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    message: '🌱 FoodRescue API is running',
    port: PORT,
    database: process.env.DB_NAME || 'foodrescue_db',
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);       // /api/auth/register, /api/auth/login, /api/auth/profile
app.use('/api/food', foodRoutes);       // /api/food, /api/food/mine, /api/food/:id
app.use('/api/requests', requestRoutes); // /api/requests/mine, /api/requests/incoming

// Catch unmatched /api routes with 404 JSON (do NOT serve index.html for API routes)
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ── Client-Side Routing Fallback (SPA) ────────────────────────────
// For any non-API, non-upload GET request, serve index.html so React Router handles navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexPath = path.resolve(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head><title>FoodRescue - Build Required</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 3rem;">
          <h2>🌱 FoodRescue Server is Running!</h2>
          <p>Frontend production bundle is not yet built in <code>frontend/dist</code>.</p>
          <p>Please run <code>npm run build</code> in the frontend or root directory to generate the bundle.</p>
        </body>
      </html>
    `);
  }
  next();
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

// ── Unhandled 404 handler for non-GET requests ────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 FoodRescue is running live at: http://localhost:${PORT}`);
  console.log(`📁 Frontend static bundle: ${frontendDistPath}`);
  console.log(`🍱 Uploads directory:      ${uploadsDir}`);
  console.log('========================================================');
});

