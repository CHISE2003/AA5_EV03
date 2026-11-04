/**
 * Pruebas de los servicios protegidos: clientes, equipos y órdenes de servicio.
 */
const test = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');

// Datos temporales para no tocar la información real
process.env.DATA_DIR = path.join(os.tmpdir(), `techfix-rec-${Date.now()}`);
process.env.DATA_FILE = path.join(os.tmpdir(), `users-rec-${Date.now()}.json`);
const app = require('../src/app');

let server, base, token;
test.before(async () => {
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://localhost:${server.address().port}/api`;
  // Se registra un usuario y se obtiene el token para las pruebas
  const h = { 'Content-Type': 'application/json' };
  const cred = JSON.stringify({ usuario: 'tecnico', contrasena: 'Clave123' });
  await fetch(base + '/registro', { method: 'POST', headers: h, body: cred });
  token = (await (await fetch(base + '/login', { method: 'POST', headers: h, body: cred })).json()).token;
});
test.after(() => server.close());

/** Petición con token. Devuelve { status, data }. */
async function api(metodo, ruta, body, conToken = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (conToken) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(base + ruta, { method: metodo, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, data: await r.json() };
}

test('sin token -> 401', async () => {
  assert.strictEqual((await api('GET', '/clientes', null, false)).status, 401);
});
test('login entrega token', () => assert.ok(token));

test('CRUD de clientes', async () => {
  const c = await api('POST', '/clientes', { nombre: 'Ana Gómez', documento: '1001', telefono: '3001112233', email: 'ana@mail.com' });
  assert.strictEqual(c.status, 201);
  assert.strictEqual(c.data.id, 1);
  assert.strictEqual((await api('POST', '/clientes', { nombre: 'Otra', documento: '1001', telefono: '3' })).status, 409); // documento repetido
  assert.strictEqual((await api('POST', '/clientes', { nombre: 'X' })).status, 400);                                   // faltan campos
  assert.strictEqual((await api('POST', '/clientes', { nombre: 'X', documento: '9', telefono: '3', email: 'mal' })).status, 400);
  assert.strictEqual((await api('GET', '/clientes/1')).data.nombre, 'Ana Gómez');
  assert.strictEqual((await api('GET', '/clientes?buscar=ana')).data.length, 1);
  assert.strictEqual((await api('PUT', '/clientes/1', { telefono: '3009998877' })).data.telefono, '3009998877');
  assert.strictEqual((await api('GET', '/clientes/99')).status, 404);
});

test('equipos y órdenes: flujo completo y reglas de negocio', async () => {
  // Equipo
  assert.strictEqual((await api('POST', '/equipos', { clienteId: 99, tipo: 'celular', marca: 'Samsung', modelo: 'A15' })).status, 400); // cliente inexistente
  assert.strictEqual((await api('POST', '/equipos', { clienteId: 1, tipo: 'nave', marca: 'X', modelo: 'Y' })).status, 400);              // tipo inválido
  const e = await api('POST', '/equipos', { clienteId: 1, tipo: 'celular', marca: 'Samsung', modelo: 'A15', serial: 'SN123' });
  assert.strictEqual(e.status, 201);
  assert.strictEqual((await api('GET', '/equipos?clienteId=1')).data.length, 1);
  // Orden
  assert.strictEqual((await api('POST', '/ordenes', { equipoId: 1 })).status, 400); // falta la falla
  const o = await api('POST', '/ordenes', { equipoId: 1, descripcionFalla: 'Pantalla rota', costo: 150000 });
  assert.strictEqual(o.status, 201);
  assert.strictEqual(o.data.estado, 'RECIBIDO');
  assert.strictEqual((await api('PATCH', '/ordenes/1/estado', { estado: 'INVENTADO' })).status, 400);
  assert.strictEqual((await api('PATCH', '/ordenes/1/estado', { estado: 'EN_REPARACION' })).data.estado, 'EN_REPARACION');
  assert.strictEqual((await api('GET', '/ordenes?estado=EN_REPARACION')).data.length, 1);
  // Reglas al borrar
  assert.strictEqual((await api('DELETE', '/clientes/1')).status, 409); // tiene equipos
  assert.strictEqual((await api('DELETE', '/equipos/1')).status, 409);  // tiene órdenes
  // Orden entregada ya no cambia
  await api('PATCH', '/ordenes/1/estado', { estado: 'ENTREGADO' });
  assert.strictEqual((await api('PATCH', '/ordenes/1/estado', { estado: 'LISTO' })).status, 409);
  // Se borra en el orden correcto: orden -> equipo -> cliente
  assert.strictEqual((await api('DELETE', '/ordenes/1')).status, 200);
  assert.strictEqual((await api('DELETE', '/equipos/1')).status, 200);
  assert.strictEqual((await api('DELETE', '/clientes/1')).status, 200);
});
