-- Aktifkan foreign key di setiap koneksi (juga diset di db/index.js)
PRAGMA foreign_keys = ON;

-- Pengguna (role: 'user' atau 'admin')
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Topik materi: Aljabar, Geometri, Teori Bilangan, Kombinatorika
CREATE TABLE IF NOT EXISTS topics (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT ''
);

-- Materi (konten Markdown + KaTeX), satu topik punya banyak materi
CREATE TABLE IF NOT EXISTS materials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id   INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content_md TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tingkat kesulitan: Mudah / Sedang / Sulit
CREATE TABLE IF NOT EXISTS levels (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Kompetisi: OSN, KSN, dst.
CREATE TABLE IF NOT EXISTS competitions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT ''
);

-- Soal. competition_id boleh NULL (soal latihan umum).
-- Topik/level tidak boleh dihapus selama masih dipakai soal (RESTRICT -> API balas 409).
CREATE TABLE IF NOT EXISTS problems (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  statement_md   TEXT NOT NULL,
  topic_id       INTEGER NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  level_id       INTEGER NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
  competition_id INTEGER REFERENCES competitions(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pembahasan: relasi 1-ke-1 dengan soal
CREATE TABLE IF NOT EXISTS solutions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL UNIQUE REFERENCES problems(id) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tag dan relasi many-to-many dengan soal
CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- Progres belajar: soal yang sudah diselesaikan user
CREATE TABLE IF NOT EXISTS user_progress (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id   INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, problem_id)
);

-- Indeks untuk filter dan join yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_problems_topic       ON problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_problems_level       ON problems(level_id);
CREATE INDEX IF NOT EXISTS idx_problems_competition ON problems(competition_id);
CREATE INDEX IF NOT EXISTS idx_materials_topic      ON materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_progress_user        ON user_progress(user_id);
