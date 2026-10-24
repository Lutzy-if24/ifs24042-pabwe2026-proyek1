const express = require('express');
const db = require('../db');
const HttpError = require('../utils/httpError');
const { parseId, validateBody } = require('../middleware/validate');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

const BASE_SELECT = `
  SELECT p.id, p.title, p.statement_md, p.created_at, p.updated_at,
         p.topic_id, t.name AS topic,
         p.level_id, l.name AS level,
         p.competition_id, c.name AS competition
  FROM problems p
  JOIN topics t ON t.id = p.topic_id
  JOIN levels l ON l.id = p.level_id
  LEFT JOIN competitions c ON c.id = p.competition_id`;

const problemRules = {
  title: { type: 'string', required: true, max: 150 },
  statement_md: { type: 'string', required: true, max: 10000 },
  topic_id: { type: 'integer', required: true, min: 1 },
  level_id: { type: 'integer', required: true, min: 1 },
  competition_id: { type: 'integer', min: 1 }, // opsional (null = soal latihan umum)
  tags: { type: 'stringArray', default: [] },
};

const solutionRules = {
  content_md: { type: 'string', required: true, max: 20000 },
};

// ---------- helper ----------

// Ambil tag untuk banyak soal sekaligus -> Map(problem_id -> [nama tag])
function getTagsMap(ids) {
  const map = new Map(ids.map((id) => [id, []]));
  if (ids.length === 0) return map;
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT pt.problem_id, tg.name
    FROM problem_tags pt JOIN tags tg ON tg.id = pt.tag_id
    WHERE pt.problem_id IN (${placeholders})
    ORDER BY tg.name
  `).all(...ids);
  rows.forEach((r) => map.get(r.problem_id).push(r.name));
  return map;
}

// Detail soal (tanpa isi pembahasan), atau null jika tidak ada
function getProblem(id) {
  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(id);
  if (!row) return null;
  row.tags = getTagsMap([id]).get(id);
  row.has_solution = !!db.prepare('SELECT 1 FROM solutions WHERE problem_id = ?').get(id);
  return row;
}

function requireProblem(id) {
  const problem = getProblem(id);
  if (!problem) throw new HttpError(404, 'NOT_FOUND', 'Soal tidak ditemukan');
  return problem;
}

// Pastikan topik, level, dan kompetisi yang dirujuk benar-benar ada
function assertRefs({ topic_id, level_id, competition_id }) {
  const details = [];
  if (!db.prepare('SELECT 1 FROM topics WHERE id = ?').get(topic_id)) {
    details.push({ field: 'topic_id', message: 'Topik tidak ditemukan' });
  }
  if (!db.prepare('SELECT 1 FROM levels WHERE id = ?').get(level_id)) {
    details.push({ field: 'level_id', message: 'Level tidak ditemukan' });
  }
  if (competition_id !== null && !db.prepare('SELECT 1 FROM competitions WHERE id = ?').get(competition_id)) {
    details.push({ field: 'competition_id', message: 'Kompetisi tidak ditemukan' });
  }
  if (details.length) throw new HttpError(400, 'VALIDATION_ERROR', 'Referensi tidak valid', details);
}

// Ganti seluruh tag sebuah soal (dipanggil di dalam transaksi)
function setTags(problemId, names) {
  db.prepare('DELETE FROM problem_tags WHERE problem_id = ?').run(problemId);
  const insTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
  const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
  const link = db.prepare('INSERT INTO problem_tags (problem_id, tag_id) VALUES (?, ?)');
  names.forEach((name) => {
    insTag.run(name);
    link.run(problemId, getTag.get(name).id);
  });
}

// ---------- soal ----------

// GET /api/problems?topic=&level=&competition=&q=&page=&limit=&sort=
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const where = [];
  const params = [];
  if (req.query.topic) { where.push('p.topic_id = ?'); params.push(parseId(req.query.topic, 'topic')); }
  if (req.query.level) { where.push('p.level_id = ?'); params.push(parseId(req.query.level, 'level')); }
  if (req.query.competition) { where.push('p.competition_id = ?'); params.push(parseId(req.query.competition, 'competition')); }

  const q = String(req.query.q || '').trim().slice(0, 100);
  if (q) {
    // Escape karakter khusus LIKE agar "%" atau "_" dicari apa adanya
    const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    where.push("(p.title LIKE ? ESCAPE '\\' OR p.statement_md LIKE ? ESCAPE '\\')");
    params.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const direction = req.query.sort === 'oldest' ? 'ASC' : 'DESC';

  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM problems p ${whereSql}`).get(...params);
  const rows = db
    .prepare(`${BASE_SELECT} ${whereSql} ORDER BY p.created_at ${direction}, p.id ${direction} LIMIT ? OFFSET ?`)
    .all(...params, limit, (page - 1) * limit);

  const tagsMap = getTagsMap(rows.map((r) => r.id));
  rows.forEach((r) => { r.tags = tagsMap.get(r.id); });

  res.json({
    data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/problems/:id - pembahasan TIDAK disertakan
router.get('/:id', (req, res) => {
  res.json({ data: requireProblem(parseId(req.params.id)) });
});

router.post('/', ...adminOnly, (req, res) => {
  const data = validateBody(req.body, problemRules);
  assertRefs(data);

  const id = db.transaction(() => {
    const info = db.prepare(
      'INSERT INTO problems (title, statement_md, topic_id, level_id, competition_id) VALUES (?, ?, ?, ?, ?)'
    ).run(data.title, data.statement_md, data.topic_id, data.level_id, data.competition_id);
    setTags(info.lastInsertRowid, data.tags);
    return info.lastInsertRowid;
  })();

  res.status(201).json({ data: getProblem(id) });
});

router.put('/:id', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  requireProblem(id);
  const data = validateBody(req.body, problemRules);
  assertRefs(data);

  db.transaction(() => {
    db.prepare(`
      UPDATE problems
      SET title = ?, statement_md = ?, topic_id = ?, level_id = ?, competition_id = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(data.title, data.statement_md, data.topic_id, data.level_id, data.competition_id, id);
    setTags(id, data.tags);
  })();

  res.json({ data: getProblem(id) });
});

router.delete('/:id', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  requireProblem(id);
  db.prepare('DELETE FROM problems WHERE id = ?').run(id); // pembahasan, tag, progres ikut terhapus (CASCADE)
  res.status(204).end();
});

// ---------- pembahasan ----------

// GET /api/problems/:id/solution - dipanggil saat tombol "Lihat Pembahasan" diklik
router.get('/:id/solution', (req, res) => {
  const id = parseId(req.params.id);
  requireProblem(id);
  const solution = db
    .prepare('SELECT problem_id, content_md, updated_at FROM solutions WHERE problem_id = ?')
    .get(id);
  if (!solution) throw new HttpError(404, 'NOT_FOUND', 'Pembahasan untuk soal ini belum tersedia');
  res.json({ data: solution });
});

// PUT /api/problems/:id/solution - buat atau ubah (upsert)
router.put('/:id/solution', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  requireProblem(id);
  const data = validateBody(req.body, solutionRules);
  db.prepare(`
    INSERT INTO solutions (problem_id, content_md) VALUES (?, ?)
    ON CONFLICT(problem_id) DO UPDATE SET content_md = excluded.content_md, updated_at = datetime('now')
  `).run(id, data.content_md);
  const solution = db
    .prepare('SELECT problem_id, content_md, updated_at FROM solutions WHERE problem_id = ?')
    .get(id);
  res.json({ data: solution });
});

router.delete('/:id/solution', ...adminOnly, (req, res) => {
  const id = parseId(req.params.id);
  requireProblem(id);
  const info = db.prepare('DELETE FROM solutions WHERE problem_id = ?').run(id);
  if (info.changes === 0) throw new HttpError(404, 'NOT_FOUND', 'Pembahasan untuk soal ini belum tersedia');
  res.status(204).end();
});

module.exports = router;
