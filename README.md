# API REST – TechFix Solutions S.A.S.

Evidencia **GA7-220501096-AA5-EV03** – Diseño y desarrollo de servicios web (SENA – ADSO).

API REST en Node.js + Express para gestionar el taller de reparación de equipos:
autenticación, **clientes**, **equipos** y **órdenes de servicio**.
La documentación completa de cada servicio está en `DOCUMENTACION_SERVICIOS.docx` (carpeta superior del ZIP).

## Ejecución
```bash
npm install
npm start      # http://localhost:3000
npm test       # 10 pruebas automáticas
```

## Servicios
| Servicio | Base | Acceso |
|---|---|---|
| Autenticación | `/api/registro`, `/api/login` | Público (login devuelve un token) |
| Clientes | `/api/clientes` | Token |
| Equipos | `/api/equipos` | Token |
| Órdenes de servicio | `/api/ordenes` | Token |

Las rutas protegidas exigen el header `Authorization: Bearer <token>`.
Cada recurso tiene: `GET /` (listar), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
Además: `PATCH /api/ordenes/:id/estado`.

## Estructura
```
src/app.js, src/server.js        arranque y configuración
src/routes/                      rutas (auth y recursos)
src/middleware/auth.middleware.js  validación del token
src/controllers/                 lógica de cada servicio (crud.factory.js = base común)
src/services/                    repositorio JSON, usuarios con hash, tokens
test/                            pruebas automáticas
postman/                         colección de Postman (EV02)
```
