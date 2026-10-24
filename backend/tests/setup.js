// Dijalankan sebelum setiap file test. Env harus diset SEBELUM config/db di-require.
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'rahasia-khusus-test';
process.env.BCRYPT_ROUNDS = '4'; // lebih cepat saat test
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'Admin12345';

// Setiap file test mendapat database in-memory baru berisi schema + seed
beforeAll(() => {
  require('../src/db/init').initDatabase();
});
