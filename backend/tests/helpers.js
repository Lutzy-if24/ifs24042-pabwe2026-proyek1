const request = require('supertest');
const app = require('../src/app');

// Login sebagai admin hasil seed, kembalikan token
async function loginAdmin() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  return res.body.data.token;
}

// Daftarkan user biasa baru, kembalikan token
async function registerUser(name = 'budi') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: name, email: `${name}@mail.com`, password: 'rahasia123' });
  return res.body.data.token;
}

module.exports = { loginAdmin, registerUser };
