const request = require('supertest');
const app = require('../src/app');

// ID dari seed: topik 1=Aljabar; level 3=Sulit; kompetisi 1=OSN, 2=KSN
describe('Soal (publik)', () => {
  test('daftar soal mengembalikan pagination yang benar', async () => {
    const res = await request(app).get('/api/problems?limit=8&page=3');

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 3, limit: 8, total: 20, totalPages: 3 });
    expect(res.body.data).toHaveLength(4); // halaman terakhir: 20 - 16
  });

  test('filter berdasarkan topik', async () => {
    const res = await request(app).get('/api/problems?topic=1&limit=50');

    expect(res.body.meta.total).toBe(5);
    expect(res.body.data.every((p) => p.topic === 'Aljabar')).toBe(true);
  });

  test('filter berdasarkan tingkat kesulitan', async () => {
    const res = await request(app).get('/api/problems?level=3&limit=50');

    expect(res.body.meta.total).toBe(4);
    expect(res.body.data.every((p) => p.level === 'Sulit')).toBe(true);
  });

  test('filter berdasarkan kompetisi dan kombinasi filter', async () => {
    const osn = await request(app).get('/api/problems?competition=1&limit=50');
    expect(osn.body.meta.total).toBe(8);

    const gabungan = await request(app).get('/api/problems?competition=1&topic=1&level=3');
    expect(gabungan.body.meta.total).toBe(1);
    expect(gabungan.body.data[0].competition).toBe('OSN');
  });

  test('pencarian kata kunci pada judul dan teks soal', async () => {
    const res = await request(app).get('/api/problems?q=faktor&limit=50');

    expect(res.body.meta.total).toBeGreaterThan(0);
    expect(
      res.body.data.every((p) => `${p.title} ${p.statement_md}`.toLowerCase().includes('faktor'))
    ).toBe(true);
  });

  test('karakter wildcard "%" dicari apa adanya', async () => {
    const res = await request(app).get('/api/problems?q=%25');
    expect(res.body.meta.total).toBe(0);
  });

  test('parameter filter tidak valid ditolak (400)', async () => {
    const res = await request(app).get('/api/problems?topic=abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('detail soal berisi tag tetapi tidak membawa isi pembahasan', async () => {
    const res = await request(app).get('/api/problems/1');

    expect(res.status).toBe(200);
    expect(res.body.data.statement_md).toBeDefined();
    expect(res.body.data.tags.length).toBeGreaterThan(0);
    expect(res.body.data.has_solution).toBe(true);
    expect(res.body.data.solution).toBeUndefined();
  });

  test('pembahasan diambil lewat endpoint tersendiri', async () => {
    const res = await request(app).get('/api/problems/1/solution');

    expect(res.status).toBe(200);
    expect(res.body.data.content_md).toContain('Jawaban');
  });

  test('soal yang tidak ada mengembalikan 404 dengan format error seragam', async () => {
    const res = await request(app).get('/api/problems/9999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: expect.any(String) } });
  });

  test('data referensi dan topik tersedia', async () => {
    const topics = await request(app).get('/api/topics');
    expect(topics.body.data).toHaveLength(4);
    expect(topics.body.data[0].problem_count).toBe(5);

    const levels = await request(app).get('/api/levels');
    expect(levels.body.data.map((l) => l.name)).toEqual(['Mudah', 'Sedang', 'Sulit']);

    const comps = await request(app).get('/api/competitions');
    expect(comps.body.data.map((c) => c.name)).toEqual(['OSN', 'KSN']);
  });
});
