const HttpError = require('../utils/httpError');

// Ubah parameter id menjadi integer positif, atau lempar 400
function parseId(value, name = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new HttpError(400, 'VALIDATION_ERROR', `Parameter ${name} harus berupa bilangan bulat positif`);
  }
  return n;
}

/**
 * Validasi body berdasarkan aturan per field.
 * Tipe: 'string' | 'integer' | 'stringArray'.
 * Field opsional yang kosong diisi rule.default (atau null).
 * Mengembalikan objek bersih, atau melempar 400 dengan daftar error.
 */
function validateBody(body, rules) {
  const src = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const data = {};
  const details = [];
  const fail = (field, message) => details.push({ field, message });

  for (const [field, rule] of Object.entries(rules)) {
    const raw = src[field];
    const isEmpty =
      raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '');

    if (isEmpty) {
      if (rule.required) fail(field, `${field} wajib diisi`);
      else data[field] = rule.default !== undefined ? rule.default : null;
      continue;
    }

    if (rule.type === 'string') {
      if (typeof raw !== 'string') { fail(field, `${field} harus berupa teks`); continue; }
      const v = rule.noTrim ? raw : raw.trim();
      if (rule.min && v.length < rule.min) fail(field, `${field} minimal ${rule.min} karakter`);
      else if (rule.max && v.length > rule.max) fail(field, `${field} maksimal ${rule.max} karakter`);
      else if (rule.pattern && !rule.pattern.test(v)) fail(field, rule.patternMessage || `${field} formatnya tidak valid`);
      else data[field] = rule.lowercase ? v.toLowerCase() : v;
    } else if (rule.type === 'integer') {
      const n = typeof raw === 'number' ? raw
        : (typeof raw === 'string' && /^-?\d+$/.test(raw.trim()) ? Number(raw) : NaN);
      if (!Number.isInteger(n)) fail(field, `${field} harus berupa bilangan bulat`);
      else if (rule.min !== undefined && n < rule.min) fail(field, `${field} minimal ${rule.min}`);
      else data[field] = n;
    } else if (rule.type === 'stringArray') {
      if (!Array.isArray(raw) || raw.some((x) => typeof x !== 'string' || !x.trim() || x.trim().length > 30)) {
        fail(field, `${field} harus berupa daftar teks (masing-masing 1-30 karakter)`);
      } else if (raw.length > 10) {
        fail(field, `${field} maksimal 10 item`);
      } else {
        data[field] = [...new Set(raw.map((x) => x.trim().toLowerCase()))];
      }
    }
  }

  if (details.length) throw new HttpError(400, 'VALIDATION_ERROR', 'Input tidak valid', details);
  return data;
}

module.exports = { parseId, validateBody };
