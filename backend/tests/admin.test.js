const request = require('supertest');
const app = require('../src/app');
const { loginAdmin, registerUser } = require('./helpers');

describe('Akses admin', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    adminToken = await loginAdmin();
    userToken = await registerUser('siswa');
  });

  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  test('tanpa login: membuat topik ditolak (401)', async () => {
    const res = await request(app).post('/api/topics').send({ name: 'X', slug: 'x' });
    expect(res.status).toBe(401);
  });

  test('user biasa: membuat topik ditolak (403)', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set(auth(userToken))
      .send({ name: 'Kalkulus', slug: 'kalkulus' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('user biasa: mengubah dan menghapus soal ditolak (403)', async () => {
    const put = await request(app).put('/api/problems/1').set(auth(userToken)).send({});
    expect(put.status).toBe(403);

    const del = await request(app).delete('/api/problems/1').set(auth(userToken));
    expect(del.status).toBe(403);
  });

  test('admin: CRUD topik, termasuk duplikat slug (409)', async () => {
    const created = await request(app)
      .post('/api/topics')
      .set(auth(adminToken))
      .send({ name: 'Kalkulus Dasar', slug: 'kalkulus-dasar', description: 'Uji' });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const duplicate = await request(app)
      .post('/api/topics')
      .set(auth(adminToken))
      .send({ name: 'Nama Lain', slug: 'kalkulus-dasar' });
    expect(duplicate.status).toBe(409);

    const updated = await request(app)
      .put(`/api/topics/${id}`)
      .set(auth(adminToken))
      .send({ name: 'Kalkulus', slug: 'kalkulus-dasar' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe('Kalkulus');

    const removed = await request(app).delete(`/api/topics/${id}`).set(auth(adminToken));
    expect(removed.status).toBe(204);
  });

  test('admin: topik yang masih punya soal tidak bisa dihapus (409)', async () => {
    const res = await request(app).delete('/api/topics/1').set(auth(adminToken));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('admin: validasi soal baru mengembalikan 400 dengan detail', async () => {
    const kosong = await request(app).post('/api/problems').set(auth(adminToken)).send({ title: '' });
    expect(kosong.status).toBe(400);
    expect(kosong.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(kosong.body.error.details)).toBe(true);

    const refSalah = await request(app)
      .post('/api/problems')
      .set(auth(adminToken))
      .send({ title: 'T', statement_md: 'S', topic_id: 999, level_id: 1 });
    expect(refSalah.status).toBe(400);
    expect(refSalah.body.error.details[0].field).toBe('topic_id');
  });

  test('admin: siklus lengkap soal + tag + pembahasan', async () => {
    const created = await request(app)
      .post('/api/problems')
      .set(auth(adminToken))
      .send({
        title: 'Soal Uji',
        statement_md: 'Hitung $1+1$.',
        topic_id: 1,
        level_id: 1,
        tags: ['Uji', 'uji', 'Coba'], // duplikat dan huruf besar dinormalkan
      });
    expect(created.status).toBe(201);
    expect(created.body.data.tags).toEqual(['coba', 'uji']);
    expect(created.body.data.has_solution).toBe(false);
    const id = created.body.data.id;

    // Pembahasan belum ada
    const belum = await request(app).get(`/api/problems/${id}/solution`);
    expect(belum.status).toBe(404);

    // Upsert pembahasan
    const solusi = await request(app)
      .put(`/api/problems/${id}/solution`)
      .set(auth(adminToken))
      .send({ content_md: 'Jawabannya $2$.' });
    expect(solusi.status).toBe(200);

    const ada = await request(app).get(`/api/problems/${id}/solution`);
    expect(ada.body.data.content_md).toBe('Jawabannya $2$.');

    // Ubah soal
    const diubah = await request(app)
      .put(`/api/problems/${id}`)
      .set(auth(adminToken))
      .send({ title: 'Soal Uji (Revisi)', statement_md: 'Hitung $2+2$.', topic_id: 2, level_id: 2, competition_id: 2, tags: [] });
    expect(diubah.status).toBe(200);
    expect(diubah.body.data).toMatchObject({ title: 'Soal Uji (Revisi)', topic: 'Geometri', competition: 'KSN', tags: [] });

    // Hapus soal -> pembahasan ikut terhapus
    const hapus = await request(app).delete(`/api/problems/${id}`).set(auth(adminToken));
    expect(hapus.status).toBe(204);
    const hilang = await request(app).get(`/api/problems/${id}`);
    expect(hilang.status).toBe(404);
  });

  test('admin: CRUD materi', async () => {
    const created = await request(app)
      .post('/api/materials')
      .set(auth(adminToken))
      .send({ topic_id: 1, title: 'Materi Uji', content_md: '# Halo $x^2$' });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const publik = await request(app).get(`/api/materials/${id}`);
    expect(publik.body.data.topic).toBe('Aljabar');

    const hapus = await request(app).delete(`/api/materials/${id}`).set(auth(adminToken));
    expect(hapus.status).toBe(204);
  });
});
