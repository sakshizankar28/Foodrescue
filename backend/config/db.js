// config/db.js
// Purpose: Connects the Node.js backend to the MySQL database.
// Uses mysql2/promise so we can write clean async/await queries.

const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create a connection pool to handle multiple simultaneous database requests
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'foodrescue_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Use promise wrapper for async/await support
const db = pool.promise();

// Test the database connection once when the server starts
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'foodrescue_db');
    connection.release();
  }
});

module.exports = db;

