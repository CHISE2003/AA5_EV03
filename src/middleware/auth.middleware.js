/**
 * auth.middleware.js
 * Protege las rutas: exige el header  Authorization: Bearer <token>
 */
const { verificarToken } = require('../services/token');

function exigirToken(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;
  const datos = token && verificarToken(token);
  if (!datos) {
    return res.status(401).json({ mensaje: 'Token no enviado, inválido o vencido' });
  }
  req.usuario = datos.usuario; // disponible para los controladores
  return next();
}

module.exports = { exigirToken };
