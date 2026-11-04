/**
 * equipo.controller.js
 * Servicio de EQUIPOS (computadores, celulares, etc.) que pertenecen a un cliente.
 */
const { crearCrud, faltante } = require('./crud.factory');
const repo = require('../services/repository');

const TIPOS = ['computador', 'celular', 'tablet', 'otro'];

module.exports = crearCrud({
  coleccion: 'equipos',
  nombre: 'Equipo',
  campos: ['clienteId', 'tipo', 'marca', 'modelo', 'serial'],

  validar: (d) => {
    const falta = faltante(d, ['marca', 'modelo']);
    if (falta) return { status: 400, mensaje: `El campo ${falta} es obligatorio` };
    if (!TIPOS.includes(d.tipo)) {
      return { status: 400, mensaje: `El tipo debe ser: ${TIPOS.join(', ')}` };
    }
    d.clienteId = Number(d.clienteId);
    if (!repo.buscar('clientes', d.clienteId)) {
      return { status: 400, mensaje: 'El cliente indicado no existe' };
    }
    return null;
  },

  // No se puede borrar un equipo que tenga órdenes de servicio
  antesDeBorrar: (e) =>
    repo.todos('ordenes').some((o) => o.equipoId === e.id)
      ? { status: 409, mensaje: 'No se puede eliminar: el equipo tiene órdenes de servicio' }
      : null,

  // GET /api/equipos?clienteId=1
  filtrar: (items, q) => (q.clienteId ? items.filter((e) => e.clienteId === Number(q.clienteId)) : items),
});
