# Dashboard de movimientos (Vercel + Postgres + React)

Front en React con login y 3 gráficos (torta, línea, barra) que se filtran. API en funciones de Vercel que consulta Postgres.

## Estructura
- `api/login.js` POST: usuario y clave -> token JWT (1 hora). Bloquea la IP 15 min tras 5 fallos.
- `api/movimientos.js` GET (filtros categoria, region, desde, hasta) y `api/opciones.js` GET: piden `Authorization: Bearer <token>`.
- `api/_valida.js` validación de entradas, `api/_auth.js` verificación del token, `api/_log.js` auditoría, `api/_db.js` conexión (certificado verificado).
- `db/schema.sql` tablas `movimientos`, `usuarios`, `auditoria`. `db/roles.sql` usuario `app_api` solo lectura.
- `scripts/seed.js` carga 300 movimientos ficticios y crea el usuario `admin`.
- `vercel.json` cabeceras de seguridad (CSP, HSTS, X-Frame-Options, no-store en /api).

## Puesta en marcha
1. Crear la base Neon (Storage en Vercel). Copiar su `DATABASE_URL` (administrador) a `.env.local`, junto con `ADMIN_PASSWORD` (mínimo 8 caracteres).
2. `npm install` y `npm run seed`.
3. Ejecutar `db/roles.sql` en la base (cambiar la clave y el nombre de la base). Crea el usuario `app_api`.
4. En Vercel (Settings > Environment Variables): `DATABASE_URL` con la URL de **app_api**, y `JWT_SECRET` (largo y aleatorio).
5. Redeploy.

## Ambientes
- **Desarrollo:** PC local, `.env.local`, datos ficticios del seed.
- **Prueba:** Preview Deployments de Vercel, variables del ambiente *Preview* apuntando a una branch de Neon de prueba y otro `JWT_SECRET`.
- **Producción:** rama `main`, variables del ambiente *Production*.
