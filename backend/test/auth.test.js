const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../src/config');
const { createAuthMiddleware } = require('../src/middleware/auth');
const access = require('../src/middleware/managementAccess');
process.env.JWT_SECRET = 'unit-only-random-secret-with-over-32-characters';
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
function token(data = { id: 1, rol: 'admin' }, options = {}) {
 return jwt.sign(data, getJwtSecret(), { algorithm: 'HS256', issuer: 'hubiavante', audience: 'hubiavante-web', expiresIn: '1h', ...options });
}
test('rechaza secretos ausentes y valores de ejemplo', () => {
 const saved = process.env.JWT_SECRET;
 for (const secret of ['', 'short', 'hub_iavante_secret_prod_change_me_123456']) {
  process.env.JWT_SECRET = secret; assert.throws(getJwtSecret);
 }
 process.env.JWT_SECRET = saved;
});
test('rechaza ausencia de Bearer, firma ajena y audiencia incorrecta', async () => {
 const auth = createAuthMiddleware({ usuario: { findUnique() { throw Error('No debe consultar'); } } });
 for (const authorization of [undefined, 'Basic abc', 'Bearer invalid', `Bearer ${token({ id: 1 }, { audience: 'another-app' })}`]) {
  const res = response(); await auth({ headers: { authorization } }, res, () => assert.fail('No debe aceptar'));
  assert.equal(res.statusCode, 401);
 }
});
test('un token antiguo no conserva el rol admin si cambia en PostgreSQL', async () => {
 const auth = createAuthMiddleware({ usuario: { async findUnique() { return { id: 1, rol: 'docente', activo: true }; } } });
 const req = { headers: { authorization: `Bearer ${token()}` }, method: 'GET' }; const res = response();
 await auth(req, res, () => access(req, res, () => assert.fail('No debe acceder')));
 assert.equal(res.statusCode, 403);
});
test('revoca acceso inmediatamente a usuarios inactivos o eliminados', async () => {
 for (const usuario of [null, { id: 1, activo: false, rol: 'admin' }]) {
  const res = response(); const auth = createAuthMiddleware({ usuario: { async findUnique() { return usuario; } } });
  await auth({ headers: { authorization: `Bearer ${token()}` } }, res, () => assert.fail('No debe acceder'));
  assert.equal(res.statusCode, 401);
 }
});
test('matriz de permisos de administración y gestión', () => {
 for (const rol of ['admin', 'gestor', 'docente', 'unknown']) for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
  const res = response(); let allowed = false; access({ user: { rol }, method }, res, () => { allowed = true; });
  assert.equal(allowed, rol === 'admin' || (rol === 'gestor' && method !== 'DELETE'));
 }
});
