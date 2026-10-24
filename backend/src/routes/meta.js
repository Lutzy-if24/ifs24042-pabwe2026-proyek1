const express = require('express');
const db = require('../db');

const router = express.Router();

// Data referensi untuk dropdown filter (hanya baca; diisi lewat seed)
router.get('/levels', (req, res) => {
  res.json({ data: db.prepare('SELECT id, name FROM levels ORDER BY sort_order, id').all() });
});

router.get('/competitions', (req, res) => {
  res.json({ data: db.prepare('SELECT id, name, full_name FROM competitions ORDER BY id').all() });
});

router.get('/tags', (req, res) => {
  res.json({ data: db.prepare('SELECT id, name FROM tags ORDER BY name').all() });
});

module.exports = router;
