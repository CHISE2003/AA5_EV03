/**
 * crud.factory.js
 * Fábrica de controladores CRUD. Evita repetir el mismo código en cada
 * servicio: cada recurso solo indica su colección, sus campos y sus reglas.
 *
 * Reglas (hooks) que recibe cada recurso:
 *  - validar(datos, id)  -> null si todo está bien, o { status, mensaje }
 *  - antesDeBorrar(item) -> null si se puede borrar, o { status, mensaje }
 *  - filtrar(items, query) -> filtra el listado según parámetros de la URL
 *  - porDefecto()        -> valores iniciales al crear
 */
const repo = require('../services/repository');

function crearCrud({ coleccion, nombre, campos, validar, antesDeBorrar, filtrar, porDefecto }) {
  /** Toma solo los campos permitidos del body y limpia los espacios. */
  const tomarCampos = (body = {}) => {
    const datos = {};
    for (const c of campos) {
      if (body[c] !== undefined) datos[c] = typeof body[c] === 'string' ? body[c].trim() : body[c];
    }
    return datos;
  };
  const noEncontrado = (res) => res.status(404).json({ mensaje: `${nombre} no encontrado` });

  /** GET /  -> lista (con filtros opcionales) */
  const listar = (req, res) => {
    let items = repo.todos(coleccion);
    if (filtrar) items = filtrar(items, req.query);
    res.json(items);
  };

  /** GET /:id -> un registro */
  const obtener = (req, res) => {
    const item = repo.buscar(coleccion, Number(req.params.id));
    return item ? res.json(item) : noEncontrado(res);
  };

  /** POST / -> crea un registro */
  const crear = (req, res) => {
    const datos = { ...(porDefecto ? porDefecto() : {}), ...tomarCampos(req.body) };
    const error = validar(datos, null);
    if (error) return res.status(error.status).json({ mensaje: error.mensaje });
    return res.status(201).json(repo.crear(coleccion, datos));
  };

  /** PUT /:id -> actualiza los campos enviados */
  const actualizar = (req, res) => {
    const id = Number(req.params.id);
    const existente = repo.buscar(coleccion, id);
    if (!existente) return noEncontrado(res);
    const datos = { ...existente, ...tomarCampos(req.body) };
    const error = validar(datos, id);
    if (error) return res.status(error.status).json({ mensaje: error.mensaje });
    return res.json(repo.actualizar(coleccion, id, datos));
  };

  /** DELETE /:id -> elimina un registro (si las reglas lo permiten) */
  const eliminar = (req, res) => {
    const id = Number(req.params.id);
    const existente = repo.buscar(coleccion, id);
    if (!existente) return noEncontrado(res);
    const error = antesDeBorrar && antesDeBorrar(existente);
    if (error) return res.status(error.status).json({ mensaje: error.mensaje });
    repo.eliminar(coleccion, id);
    return res.json({ mensaje: `${nombre} eliminado correctamente` });
  };

  return { listar, obtener, crear, actualizar, eliminar };
}

/** Devuelve el primer campo de texto obligatorio que falte, o null. */
function faltante(datos, obligatorios) {
  return obligatorios.find((c) => typeof datos[c] !== 'string' || datos[c] === '') || null;
}

module.exports = { crearCrud, faltante };
