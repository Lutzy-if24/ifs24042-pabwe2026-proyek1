const request = require('supertest');
const app = require('../src/app');
const { registerUser } = require('./helpers');

describe('Auth', () => {
  test('register berhasil: mengembalikan token dan role user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'andi', email: 'Andi@Mail.com', password: 'rahasia123' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({ username: 'andi', email: 'andi@mail.com', role: 'user' });
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  test('register dengan email yang sama ditolak (409)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'andi2', email: 'andi@mail.com', password: 'rahasia123' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('register dengan input tidak valid ditolak (400) beserta detailnya', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'bukan-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
  });

  test('user tidak bisa mendaftar sebagai admin lewat field role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'nakal', email: 'nakal@mail.com', password: 'rahasia123', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('user');
  });

  test('login berhasil lalu GET /auth/me memakai token', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'andi@mail.com', password: 'rahasia123' });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.username).toBe('andi');
  });

  test('login dengan password salah ditolak (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'andi@mail.com', password: 'salahsalah' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('GET /auth/me tanpa token atau dengan token palsu ditolak (401)', async () => {
    const tanpaToken = await request(app).get('/api/auth/me');
    expect(tanpaToken.status).toBe(401);

    const tokenPalsu = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
    expect(tokenPalsu.status).toBe(401);
  });

  test('helper registerUser menghasilkan token yang valid', async () => {
    const token = await registerUser('citra');
    expect(typeof token).toBe('string');
  });
});
