const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const HttpError = require('../utils/httpError');

// Verifikasi JWT, lalu ambil user terbaru dari database (role selalu aktual)
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Token autentikasi tidak ditemukan'));
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(payload.sub);
    if (!user) return next(new HttpError(401, 'UNAUTHORIZED', 'Pengguna tidak ditemukan'));
    req.user = user;
    return next();
  } catch (e) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Token tidak valid atau sudah kedaluwarsa'));
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new HttpError(403, 'FORBIDDEN', 'Hanya admin yang dapat mengakses endpoint ini'));
  }
  return next();
}

// Pemakaian: router.post('/', ...adminOnly, handler)
const adminOnly = [authenticate, requireAdmin];

module.exports = { authenticate, requireAdmin, adminOnly };
// TODO: Pastikan JWT_SECRET di production menggunakan environment variable yang aman
