/**
 * repository.js
 * Repositorio genérico: guarda cada colección (clientes, equipos, ordenes)
 * en un archivo JSON dentro de la carpeta data/. Asigna ids autoincrementales.
 */
const fs = require('fs');
const path = require('path');

/** Carpeta de datos (configurable con la variable DATA_DIR). */
const carpeta = () => process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const archivo = (col) => path.join(carpeta(), `${col}.json`);

/** Lee todos los registros de una colección ([] si aún no existe). */
function todos(col) {
  if (!fs.existsSync(archivo(col))) return [];
  return JSON.parse(fs.readFileSync(archivo(col), 'utf8'));
}

/** Sobrescribe la colección completa. */
function guardar(col, items) {
  fs.mkdirSync(carpeta(), { recursive: true });
  fs.writeFileSync(archivo(col), JSON.stringify(items, null, 2));
}

/** Busca un registro por id. */
function buscar(col, id) {
  return todos(col).find((i) => i.id === id);
}

/** Inserta un registro nuevo con id y fecha de creación. */
function crear(col, datos) {
  const items = todos(col);
  const id = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  const nuevo = { id, ...datos, creadoEn: new Date().toISOString() };
  items.push(nuevo);
  guardar(col, items);
  return nuevo;
}

/** Actualiza un registro existente (conserva id y creadoEn). */
function actualizar(col, id, datos) {
  const items = todos(col);
  const i = items.findIndex((x) => x.id === id);
  if (i === -1) return null;
  items[i] = { ...items[i], ...datos, id, actualizadoEn: new Date().toISOString() };
  guardar(col, items);
  return items[i];
}

/** Elimina un registro por id. */
function eliminar(col, id) {
  guardar(col, todos(col).filter((i) => i.id !== id));
}

module.exports = { todos, buscar, crear, actualizar, eliminar };
