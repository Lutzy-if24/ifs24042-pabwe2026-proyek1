const HttpError = require('../utils/httpError');

// Endpoint yang tidak ada
function notFound(req, res, next) {
  next(new HttpError(404, 'NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));
}

// Semua error diubah ke format: { error: { code, message, details? } }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Terjadi kesalahan pada server';
  let details;

  if (err instanceof HttpError) {
    ({ status, code, message, details } = err);
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Body request bukan JSON yang valid';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Body request terlalu besar';
  } else if (typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    // Pelanggaran UNIQUE / FOREIGN KEY (mis. hapus topik yang masih punya soal)
    status = 409;
    code = 'CONFLICT';
    message = /UNIQUE|PRIMARYKEY/.test(err.code)
      ? 'Data dengan nilai tersebut sudah ada'
      : 'Data masih dipakai oleh data lain sehingga tidak dapat diubah atau dihapus';
  }

  if (status === 500 && process.env.NODE_ENV !== 'test') console.error(err);

  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

module.exports = { notFound, errorHandler };
