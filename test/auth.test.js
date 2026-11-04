/**
 * Pruebas automáticas del servicio (node --test).
 */
const test = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');

// Usa un archivo temporal para no tocar datos reales
process.env.DATA_DIR = path.join(os.tmpdir(), `techfix-${Date.now()}`);
process.env.DATA_FILE = path.join(os.tmpdir(), `users-${Date.now()}.json`);
const app = require('../src/app');

let server, base;
test.before(async () => {
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://localhost:${server.address().port}/api`;
});
test.after(() => server.close());

const post = (ruta, body) =>
  fetch(base + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('registro correcto -> 201', async () => {
  const r = await post('/registro', { usuario: 'jose', contrasena: 'Clave123' });
  assert.strictEqual(r.status, 201);
});
test('registro duplicado -> 409', async () => {
  const r = await post('/registro', { usuario: 'jose', contrasena: 'Clave123' });
  assert.strictEqual(r.status, 409);
});
test('login correcto -> 200 Autenticación satisfactoria', async () => {
  const r = await post('/login', { usuario: 'jose', contrasena: 'Clave123' });
  assert.strictEqual(r.status, 200);
  assert.strictEqual((await r.json()).mensaje, 'Autenticación satisfactoria');
});
test('login con contraseña incorrecta -> 401 Error en la autenticación', async () => {
  const r = await post('/login', { usuario: 'jose', contrasena: 'otra' });
  assert.strictEqual(r.status, 401);
  assert.strictEqual((await r.json()).mensaje, 'Error en la autenticación');
});
test('login con usuario inexistente -> 401', async () => {
  const r = await post('/login', { usuario: 'nadie', contrasena: 'Clave123' });
  assert.strictEqual(r.status, 401);
});
test('login sin datos -> 400', async () => {
  const r = await post('/login', {});
  assert.strictEqual(r.status, 400);
});
