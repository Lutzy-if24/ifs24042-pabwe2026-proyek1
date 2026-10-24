const path = require('path');
require('dotenv').config();

// Di production secret JWT wajib diisi lewat env
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diisi di production');
}

const dbPath = process.env.DB_PATH
  ? (process.env.DB_PATH === ':memory:' ? ':memory:' : path.resolve(process.env.DB_PATH))
  : path.join(__dirname, '..', 'data', 'olimpiade.db');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-hanya-untuk-lokal',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: (process.env.ADMIN_EMAIL || 'admin@olimpiade.local').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin12345',
  },
};
