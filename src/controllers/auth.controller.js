/**
 * auth.controller.js
 * Lógica de los endpoints de registro e inicio de sesión.
 */
const store = require('../services/user.store');
const { crearToken } = require('../services/token');

/** Valida que usuario y contraseña lleguen como texto no vacío. */
function datosValidos(body) {
  return (
    body &&
    typeof body.usuario === 'string' && body.usuario.trim() !== '' &&
    typeof body.contrasena === 'string' && body.contrasena !== ''
  );
}

/**
 * POST /api/registro
 * Body: { "usuario": "...", "contrasena": "..." }
 */
function registro(req, res) {
  if (!datosValidos(req.body)) {
    return res.status(400).json({ mensaje: 'Debe enviar usuario y contraseña' });
  }
  if (req.body.contrasena.length < 6) {
    return res
      .status(400)
      .json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const creado = store.createUser(req.body.usuario.trim(), req.body.contrasena);
  if (!creado) {
    return res.status(409).json({ mensaje: 'El usuario ya existe' });
  }
  return res
    .status(201)
    .json({ mensaje: 'Usuario registrado correctamente', usuario: creado.username });
}

/**
 * POST /api/login
 * Body: { "usuario": "...", "contrasena": "..." }
 * Éxito  -> 200 "Autenticación satisfactoria"
 * Fallo  -> 401 "Error en la autenticación"
 */
function login(req, res) {
  if (!datosValidos(req.body)) {
    return res.status(400).json({ mensaje: 'Debe enviar usuario y contraseña' });
  }
  const ok = store.verifyCredentials(req.body.usuario.trim(), req.body.contrasena);
  if (!ok) {
    // Mensaje genérico: no revela si falló el usuario o la contraseña
    return res.status(401).json({ mensaje: 'Error en la autenticación' });
  }
  // Se entrega un token que se usa en las demás rutas (Authorization: Bearer ...)
  return res.status(200).json({
    mensaje: 'Autenticación satisfactoria',
    token: crearToken(req.body.usuario.trim()),
  });
}

module.exports = { registro, login };
