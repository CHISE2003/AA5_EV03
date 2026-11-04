/**
 * orden.controller.js
 * Servicio de ÓRDENES DE SERVICIO: el trabajo de reparación de un equipo.
 * Una orden pasa por los estados definidos en ESTADOS.
 */
const { crearCrud, faltante } = require('./crud.factory');
const repo = require('../services/repository');

const ESTADOS = ['RECIBIDO', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO', 'ENTREGADO'];

const crud = crearCrud({
  coleccion: 'ordenes',
  nombre: 'Orden',
  campos: ['equipoId', 'descripcionFalla', 'diagnostico', 'costo', 'estado'],

  // Al crear: estado inicial RECIBIDO y fecha de ingreso
  porDefecto: () => ({ estado: 'RECIBIDO', fechaIngreso: new Date().toISOString() }),

  validar: (d) => {
    if (faltante(d, ['descripcionFalla'])) {
      return { status: 400, mensaje: 'El campo descripcionFalla es obligatorio' };
    }
    if (!ESTADOS.includes(d.estado)) {
      return { status: 400, mensaje: `El estado debe ser: ${ESTADOS.join(', ')}` };
    }
    if (d.costo !== undefined && (typeof d.costo !== 'number' || d.costo < 0)) {
      return { status: 400, mensaje: 'El costo debe ser un número mayor o igual a 0' };
    }
    d.equipoId = Number(d.equipoId);
    if (!repo.buscar('equipos', d.equipoId)) {
      return { status: 400, mensaje: 'El equipo indicado no existe' };
    }
    return null;
  },

  // GET /api/ordenes?estado=LISTO
  filtrar: (items, q) => (q.estado ? items.filter((o) => o.estado === q.estado) : items),
});

/**
 * PATCH /api/ordenes/:id/estado   Body: { "estado": "EN_REPARACION" }
 * Regla de negocio: una orden ENTREGADA ya no se puede modificar.
 */
crud.cambiarEstado = (req, res) => {
  const id = Number(req.params.id);
  const orden = repo.buscar('ordenes', id);
  if (!orden) return res.status(404).json({ mensaje: 'Orden no encontrada' });
  if (!ESTADOS.includes(req.body && req.body.estado)) {
    return res.status(400).json({ mensaje: `El estado debe ser: ${ESTADOS.join(', ')}` });
  }
  if (orden.estado === 'ENTREGADO') {
    return res.status(409).json({ mensaje: 'La orden ya fue entregada y no se puede modificar' });
  }
  return res.json(repo.actualizar('ordenes', id, { estado: req.body.estado }));
};

module.exports = crud;
