/**
 * cliente.controller.js
 * Servicio de CLIENTES de TechFix (personas que llevan equipos a reparar).
 */
const { crearCrud, faltante } = require('./crud.factory');
const repo = require('../services/repository');

module.exports = crearCrud({
  coleccion: 'clientes',
  nombre: 'Cliente',
  campos: ['nombre', 'documento', 'telefono', 'email', 'direccion'],

  // Reglas de validación: obligatorios, formato de email y documento único
  validar: (d, id) => {
    const falta = faltante(d, ['nombre', 'documento', 'telefono']);
    if (falta) return { status: 400, mensaje: `El campo ${falta} es obligatorio` };
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      return { status: 400, mensaje: 'El email no es válido' };
    }
    const repetido = repo.todos('clientes').find((c) => c.documento === d.documento && c.id !== id);
    if (repetido) return { status: 409, mensaje: 'Ya existe un cliente con ese documento' };
    return null;
  },

  // No se puede borrar un cliente que tenga equipos registrados
  antesDeBorrar: (c) =>
    repo.todos('equipos').some((e) => e.clienteId === c.id)
      ? { status: 409, mensaje: 'No se puede eliminar: el cliente tiene equipos registrados' }
      : null,

  // GET /api/clientes?buscar=texto  (busca por nombre o documento)
  filtrar: (items, q) => {
    if (!q.buscar) return items;
    const t = String(q.buscar).toLowerCase();
    return items.filter((c) => c.nombre.toLowerCase().includes(t) || c.documento.includes(t));
  },
});
