const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

test('HTTP real: login, persistencia, permisos y revocación con PostgreSQL', { skip: process.env.RUN_INTEGRATION_TESTS !== '1', timeout: 60000 }, async () => {
 const prisma = new PrismaClient(); const suffix = `integration-${Date.now()}`; const users = []; let alumnoId; let server;
 const password = 'OnlyForIntegration-LongPassword!'; const port = 33019; const url = `http://127.0.0.1:${port}/api`;
 try {
  for (const rol of ['admin', 'gestor', 'docente']) users.push(await prisma.usuario.create({ data: { nombre: rol, email: `${rol}-${suffix}@example.test`, password: await bcrypt.hash(password, 10), rol } }));
  server = spawn(process.execPath, ['src/server.js'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'ignore', 'pipe'] });
  let logs = ''; server.stderr.on('data', data => { logs += data.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
   if (server.exitCode !== null) throw Error(`API no pudo iniciar: ${logs}`);
   try { ready = (await fetch(`${url}/health`)).ok; } catch {}
   if (ready) break;
   await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'API debe arrancar');
  async function request(path, token, method = 'GET', body) {
   return fetch(`${url}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  }
  assert.equal((await request('/alumnos')).status, 401);
  const tokens = {};
  for (const user of users) {
   const res = await request('/auth/login', null, 'POST', { email: user.email, password }); assert.equal(res.status, 200); tokens[user.rol] = (await res.json()).token;
  }
  assert.equal((await request('/auth/login', null, 'POST', { email: users[0].email, password: 'wrong' })).status, 401);
  assert.equal((await request('/alumnos', tokens.docente)).status, 403);
  assert.equal((await request('/auth/me', tokens.docente)).status, 200);
  const created = await request('/alumnos', tokens.gestor, 'POST', { nombre: 'Prueba', apellidos: suffix, email: `${suffix}@example.test` });
  assert.equal(created.status, 201); alumnoId = (await created.json()).id;
  assert.ok(await prisma.alumno.findUnique({ where: { id: alumnoId } }), 'La API debe persistir en PostgreSQL');
  assert.equal((await request(`/alumnos/${alumnoId}`, tokens.admin)).status, 200);
  assert.equal((await request(`/alumnos/${alumnoId}`, tokens.gestor, 'DELETE')).status, 403);
  for (const path of ['/clientes', '/tarifas', '/docentes', '/fichas', '/presupuestos', '/propuestas', '/guias-alumno/ficha/1', '/guias-docente/ficha/1', '/seguimiento/ficha/1', '/informes', '/dashboard/stats']) {
   assert.equal((await request(path, tokens.docente)).status, 403, path);
  }
  await prisma.usuario.update({ where: { id: users[0].id }, data: { rol: 'docente' } });
  assert.equal((await request('/alumnos', tokens.admin)).status, 403, 'Cambio de rol debe surtir efecto sin renovar token');
  await prisma.usuario.update({ where: { id: users[1].id }, data: { activo: false } });
  assert.equal((await request('/alumnos', tokens.gestor)).status, 401);
 } finally {
  if (server && server.exitCode === null) { const exited = once(server, 'exit'); server.kill(); await exited; }
  if (alumnoId) await prisma.alumno.delete({ where: { id: alumnoId } });
  await prisma.usuario.deleteMany({ where: { id: { in: users.map(user => user.id) } } });
  await prisma.$disconnect();
 }
});
