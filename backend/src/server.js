const config = require('./config');
const { initDatabase } = require('./db/init');
const app = require('./app');

// Pastikan tabel dan data awal ada sebelum menerima request
initDatabase();

app.listen(config.port, () => {
  console.log(`API berjalan di http://localhost:${config.port}`);
});
