const express = require('express');
const db = require('../db');
const HttpError = require('../utils/httpError');
const { parseId, validateBody } = require('../middleware/validate');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

const materialRules = {
  topic_id: { type: 'integer', required: true, min: 1 },
  title: { type: 'string', required: true, max: 150 },
  content_md: { type: 'string', required: true, max: 50000 },
  sort_order: { type: 'integer', default: 0 },
};

function findMaterial(id) {
  const material = db.prepare(`
    SELECT m.id, m.topic_id, t.name AS topic, m.title, m.content_md, m.sort_order,
           m.created_at, m.updated_at
    FROM materials m JOIN topics t ON t.id = m.topic_id
    WHERE m.id = ?
  `).get(id);
  if (!material) throw new HttpError(404, 'NOT_FOUND', 'Materi tidak ditemukan');
  return material;
}

function assertTopicExists(topicId) {
  if (!db.prepare('SELECT 1 FROM topics WHERE id = ?').get(topicId)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Referensi tidak valid', [
      { field: 'topic_id', message: 'Topik tidak ditemukan' },
    ]);
  }
}

// GET /api/materials/:id - konten Markdown lengkap
router.get('/:id', (req, res) => {
  res.json({ data: findMaterial(parseId(req.params.id)) });
});

router.post('/', ...adminOnly, (req, res) => {
  const data = validateBody(req.body, materialRules);
  assertTopicExists(data.topic_id);
  const info = db
    .prepare('INSERT INTO materials (topic_id, title, content_md, sort_order) VALUES (?, ?, ?, ?)')
    .run(data.topic_id, data.title, data.content_md, data.sort_order);
  res.status(201).json({ data: findMaterial(info.lastInsertRowid) });
});

router.put('/:id', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  findMaterial(id);
  const data = validateBody(req.body, materialRules);
  assertTopicExists(data.topic_id);
  db.prepare(`
    UPDATE materials
    SET topic_id = ?, title = ?, content_md = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(data.topic_id, data.title, data.content_md, data.sort_order, id);
  res.json({ data: findMaterial(id) });
});

router.delete('/:id', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  findMaterial(id);
  db.prepare('DELETE FROM materials WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = router;
