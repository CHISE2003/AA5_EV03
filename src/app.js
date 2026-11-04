/**
 * app.js
 * Configura la aplicación Express (separada del servidor para poder probarla).
 */
const express = require('express');
const authRoutes = require('./routes/auth.routes');
const recursosRoutes = require('./routes/recursos.routes');
const { exigirToken } = require('./middleware/auth.middleware');

const app = express();

app.use(express.json()); // Permite leer cuerpos JSON

// Ruta de verificación del estado del servicio
app.get('/', (req, res) => res.json({ servicio: 'API Registro/Login', estado: 'activo' }));

app.use('/api', authRoutes);                  // públicas: registro y login
app.use('/api', exigirToken, recursosRoutes); // protegidas: requieren token

// Ruta no encontrada -> 404
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// JSON mal formado -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'JSON inválido' });
  }
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
