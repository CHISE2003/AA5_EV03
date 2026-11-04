/**
 * recursos.routes.js
 * Rutas protegidas (requieren token) de clientes, equipos y órdenes de servicio.
 */
const express = require('express');
const clientes = require('../controllers/cliente.controller');
const equipos = require('../controllers/equipo.controller');
const ordenes = require('../controllers/orden.controller');

const router = express.Router();

/** Registra las 5 rutas CRUD estándar de un controlador bajo una ruta base. */
function rutasCrud(base, c) {
  router.get(base, c.listar);
  router.get(`${base}/:id`, c.obtener);
  router.post(base, c.crear);
  router.put(`${base}/:id`, c.actualizar);
  router.delete(`${base}/:id`, c.eliminar);
}

rutasCrud('/clientes', clientes);
rutasCrud('/equipos', equipos);
rutasCrud('/ordenes', ordenes);
router.patch('/ordenes/:id/estado', ordenes.cambiarEstado); // cambio de estado

module.exports = router;
