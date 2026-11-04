/**
 * token.js
 * Genera y verifica tokens firmados con HMAC-SHA256 (similar a un JWT sencillo).
 * Formato: <payload en base64url>.<firma>
 */
const crypto = require('crypto');

// En producción debe definirse la variable de entorno JWT_SECRET
const SECRET = process.env.JWT_SECRET || 'techfix-secreto-de-desarrollo';

const firmaDe = (payload) =>
  crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');

/** Crea un token para el usuario con vigencia en minutos (60 por defecto). */
function crearToken(usuario, minutos = 60) {
  const payload = Buffer.from(
    JSON.stringify({ usuario, exp: Date.now() + minutos * 60000 })
  ).toString('base64url');
  return `${payload}.${firmaDe(payload)}`;
}

/** Devuelve los datos del token si es válido y no ha vencido; si no, null. */
function verificarToken(token) {
  const [payload, firma] = String(token).split('.');
  if (!payload || !firma) return null;
  const esperada = Buffer.from(firmaDe(payload));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !crypto.timingSafeEqual(esperada, recibida)) return null;
  const datos = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  return datos.exp > Date.now() ? datos : null;
}

module.exports = { crearToken, verificarToken };
