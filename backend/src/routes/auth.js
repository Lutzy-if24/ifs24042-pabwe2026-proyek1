const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const HttpError = require('../utils/httpError');
const { validateBody } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email, role: u.role });

// POST /api/auth/register - role selalu 'user' (admin hanya dari seed)
router.post('/register', (req, res) => {
  const data = validateBody(req.body, {
    username: {
      type: 'string', required: true, min: 3, max: 30,
      pattern: /^[A-Za-z0-9_]+$/, patternMessage: 'username hanya boleh huruf, angka, dan underscore',
    },
    email: { type: 'string', required: true, max: 120, pattern: EMAIL_RE, patternMessage: 'format email tidak valid', lowercase: true },
    password: { type: 'string', required: true, min: 8, max: 72, noTrim: true },
  });

  const exists = db
    .prepare('SELECT 1 FROM users WHERE email = ? OR username = ?')
    .get(data.email, data.username);
  if (exists) throw new HttpError(409, 'CONFLICT', 'Username atau email sudah terdaftar');

  // bcrypt versi sinkron agar handler tetap sederhana (beban kecil untuk proyek ini)
  const hash = bcrypt.hashSync(data.password, config.bcryptRounds);
  const info = db
    .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
    .run(data.username, data.email, hash);

  const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ data: { token: signToken(user), user: publicUser(user) } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const data = validateBody(req.body, {
    email: { type: 'string', required: true, lowercase: true },
    password: { type: 'string', required: true, noTrim: true },
  });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email);
  // Pesan sama untuk email salah dan password salah (tidak membocorkan akun)
  if (!user || !bcrypt.compareSync(data.password, user.password_hash)) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email atau password salah');
  }
  res.json({ data: { token: signToken(user), user: publicUser(user) } });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ data: publicUser(req.user) });
});

module.exports = router;
