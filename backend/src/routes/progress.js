const express = require('express');
const db = require('../db');
const HttpError = require('../utils/httpError');
const { parseId } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Semua endpoint progres membutuhkan login
router.use(authenticate);

const percent = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

// GET /api/progress - soal yang selesai + ringkasan per topik
router.get('/', (req, res) => {
  const uid = req.user.id;

  const completed = db
    .prepare('SELECT problem_id, completed_at FROM user_progress WHERE user_id = ? ORDER BY completed_at DESC, problem_id DESC')
    .all(uid);

  const byTopic = db.prepare(`
    SELECT t.id AS topic_id, t.name AS topic,
           COUNT(p.id)            AS total,
           COUNT(up.problem_id)   AS completed
    FROM topics t
    LEFT JOIN problems p ON p.topic_id = t.id
    LEFT JOIN user_progress up ON up.problem_id = p.id AND up.user_id = ?
    GROUP BY t.id
    ORDER BY t.id
  `).all(uid).map((r) => ({ ...r, percent: percent(r.completed, r.total) }));

  const totalAll = byTopic.reduce((sum, r) => sum + r.total, 0);
  const doneAll = byTopic.reduce((sum, r) => sum + r.completed, 0);

  res.json({
    data: {
      completed_problem_ids: completed.map((c) => c.problem_id),
      completed,
      by_topic: byTopic,
      summary: { completed: doneAll, total: totalAll, percent: percent(doneAll, totalAll) },
    },
  });
});

// POST /api/progress/:problemId - idempotent (201 jika baru, 200 jika sudah ada)
router.post('/:problemId', (req, res) => {
  const problemId = parseId(req.params.problemId, 'problemId');
  if (!db.prepare('SELECT 1 FROM problems WHERE id = ?').get(problemId)) {
    throw new HttpError(404, 'NOT_FOUND', 'Soal tidak ditemukan');
  }
  const info = db
    .prepare('INSERT OR IGNORE INTO user_progress (user_id, problem_id) VALUES (?, ?)')
    .run(req.user.id, problemId);
  res.status(info.changes === 1 ? 201 : 200).json({ data: { problem_id: problemId, completed: true } });
});

// DELETE /api/progress/:problemId - batalkan status selesai
router.delete('/:problemId', (req, res) => {
  const problemId = parseId(req.params.problemId, 'problemId');
  db.prepare('DELETE FROM user_progress WHERE user_id = ? AND problem_id = ?').run(req.user.id, problemId);
  res.status(204).end();
});

module.exports = router;
