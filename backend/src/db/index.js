const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Buat folder data jika belum ada (kecuali database in-memory untuk test)
if (config.dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}

const db = new Database(config.dbPath);
db.pragma('foreign_keys = ON');
if (config.dbPath !== ':memory:') db.pragma('journal_mode = WAL');

module.exports = db;
