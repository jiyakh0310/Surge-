// server/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

console.log("DB USER:", process.env.DB_USER);
console.log("DB PASSWORD LOADED:", process.env.DB_PASS ? "YES" : "NO");
console.log("DB NAME:", process.env.DB_NAME);
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'surge_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;