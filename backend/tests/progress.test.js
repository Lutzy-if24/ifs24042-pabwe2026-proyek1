const request = require('supertest');
const app = require('../src/app');
const { registerUser } = require('./helpers');

describe('Progres belajar', () => {
  let tokenA;
  let tokenB;

  beforeAll(async () => {
    tokenA = await registerUser('pengguna_a');
    tokenB = await registerUser('pengguna_b');
  });

  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  test('progres membutuhkan login (401)', async () => {
    const get = await request(app).get('/api/progress');
    expect(get.status).toBe(401);

    const post = await request(app).post('/api/progress/1');
    expect(post.status).toBe(401);
  });

  test('progres awal kosong, ringkasan per topik tersedia', async () => {
    const res = await request(app).get('/api/progress').set(auth(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data.completed_problem_ids).toEqual([]);
    expect(res.body.data.by_topic).toHaveLength(4);
    expect(res.body.data.summary).toEqual({ completed: 0, total: 20, percent: 0 });
  });

  test('menandai soal selesai bersifat idempotent (201 lalu 200)', async () => {
    const pertama = await request(app).post('/api/progress/1').set(auth(tokenA));
    expect(pertama.status).toBe(201);

    const kedua = await request(app).post('/api/progress/1').set(auth(tokenA));
    expect(kedua.status).toBe(200);

    await request(app).post('/api/progress/2').set(auth(tokenA));

    const res = await request(app).get('/api/progress').set(auth(tokenA));
    expect(res.body.data.completed_problem_ids.sort()).toEqual([1, 2]);

    const aljabar = res.body.data.by_topic.find((t) => t.topic === 'Aljabar');
    expect(aljabar).toMatchObject({ completed: 2, total: 5, percent: 40 });
    expect(res.body.data.summary).toEqual({ completed: 2, total: 20, percent: 10 });
  });

  test('progres setiap user terpisah', async () => {
    const res = await request(app).get('/api/progress').set(auth(tokenB));
    expect(res.body.data.completed_problem_ids).toEqual([]);
  });

  test('membatalkan status selesai (204)', async () => {
    const hapus = await request(app).delete('/api/progress/1').set(auth(tokenA));
    expect(hapus.status).toBe(204);

    const res = await request(app).get('/api/progress').set(auth(tokenA));
    expect(res.body.data.completed_problem_ids).toEqual([2]);
  });

  test('menandai soal yang tidak ada ditolak (404), ID tidak valid ditolak (400)', async () => {
    const tidakAda = await request(app).post('/api/progress/9999').set(auth(tokenA));
    expect(tidakAda.status).toBe(404);

    const tidakValid = await request(app).post('/api/progress/abc').set(auth(tokenA));
    expect(tidakValid.status).toBe(400);
  });
});
