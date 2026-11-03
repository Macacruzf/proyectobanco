# Dashboard de movimientos (Vercel + Postgres + React)

- `api/` funciones serverless de Vercel (Node) que consultan Postgres
- `db/schema.sql` tabla de la base de datos
- `scripts/seed.js` carga 300 movimientos de ejemplo
- `src/` front en React con 3 gráficos (torta, línea, barra) que se filtran

Local: `npm install`, crear `.env.local` con `DATABASE_URL`, `npm run seed`, `npx vercel dev`.
