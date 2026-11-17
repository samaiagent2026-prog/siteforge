import crypto from 'crypto';

const DEFAULT_PASSWORD = 'admin123';

function adminPassword() {
  return process.env.SUPER_ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function secret() {
  return process.env.ADMIN_TOKEN_SECRET || `siteforge::${adminPassword()}`;
}

export function usingDefaultPassword() {
  return !process.env.SUPER_ADMIN_PASSWORD;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

export function verifyPassword(password) {
  const expected = adminPassword();
  const a = Buffer.from(String(password || ''));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Create a signed, expiring session token (stateless). */
export function createToken(ttlMs = 1000 * 60 * 60 * 8) {
  const exp = Date.now() + ttlMs;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [scope, exp, sig] = parts;
  if (scope !== 'admin') return false;
  const payload = `${scope}.${exp}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  if (Number(exp) < Date.now()) return false;
  return true;
}

/** Extract and validate the admin token from a Request. */
export function isAdminRequest(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return verifyToken(token);
}
