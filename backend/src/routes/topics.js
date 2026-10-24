const express = require('express');
const db = require('../db');
const HttpError = require('../utils/httpError');
const { parseId, validateBody } = require('../middleware/validate');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

const topicRules = {
  name: { type: 'string', required: true, max: 60 },
  slug: {
    type: 'string', required: true, max: 60,
    pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, patternMessage: 'slug hanya huruf kecil, angka, dan tanda hubung',
  },
  description: { type: 'string', max: 500, default: '' },
};

function findTopic(id) {
  const topic = db.prepare('SELECT id, name, slug, description FROM topics WHERE id = ?').get(id);
  if (!topic) throw new HttpError(404, 'NOT_FOUND', 'Topik tidak ditemukan');
  return topic;
}

// GET /api/topics - disertai jumlah soal dan materi
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT t.id, t.name, t.slug, t.description,
           (SELECT COUNT(*) FROM problems p WHERE p.topic_id = t.id)  AS problem_count,
           (SELECT COUNT(*) FROM materials m WHERE m.topic_id = t.id) AS material_count
    FROM topics t
    ORDER BY t.id
  `).all();
  res.json({ data: rows });
});

// GET /api/topics/:id - detail topik + daftar judul materi
router.get('/:id', (req, res) => {
  const topic = findTopic(parseId(req.params.id));
  topic.materials = db
    .prepare('SELECT id, title, sort_order FROM materials WHERE topic_id = ? ORDER BY sort_order, id')
    .all(topic.id);
  res.json({ data: topic });
});

router.post('/', ...adminOnly, (req, res) => {
  const data = validateBody(req.body, topicRules);
  const info = db
    .prepare('INSERT INTO topics (name, slug, description) VALUES (?, ?, ?)')
    .run(data.name, data.slug, data.description);
  res.status(201).json({ data: findTopic(info.lastInsertRowid) });
});

router.put('/:id', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  findTopic(id);
  const data = validateBody(req.body, topicRules);
  db.prepare('UPDATE topics SET name = ?, slug = ?, description = ? WHERE id = ?')
    .run(data.name, data.slug, data.description, id);
  res.json({ data: findTopic(id) });
});

// Gagal dengan 409 jika topik masih dipakai soal (ON DELETE RESTRICT)
router.delete('/:id', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  findTopic(id);
  db.prepare('DELETE FROM topics WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = router;
