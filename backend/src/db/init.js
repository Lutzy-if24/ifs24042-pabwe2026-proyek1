const fs = require('fs');
const path = require('path');
const db = require('./index');
const { seed } = require('./seed');

// Jalankan schema, lalu seed hanya jika database masih kosong.
// Aman dipanggil berulang kali (mis. hosting tanpa persistent disk).
function initDatabase() {
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

  const { total } = db.prepare('SELECT COUNT(*) AS total FROM topics').get();
  if (total === 0) {
    seed(db);
    if (process.env.NODE_ENV !== 'test') console.log('[db] Database kosong, data awal berhasil dibuat.');
    return true;
  }
  return false;
}

module.exports = { initDatabase };
