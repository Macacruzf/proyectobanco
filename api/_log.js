import { pool } from './_db.js'

// ip de quien llama (Vercel la manda en x-forwarded-for)
export const ipDe = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'desconocida'

// guarda un evento en la tabla auditoria; si falla no tumba la API, solo avisa en consola
export async function registrar(accion, usuario, detalle, ip) {
  try {
    await pool.query('INSERT INTO auditoria (usuario, accion, detalle, ip) VALUES ($1,$2,$3,$4)', [
      usuario ? String(usuario).slice(0, 40) : null,
      accion,
      detalle ? String(detalle).slice(0, 300) : null,
      ip || null,
    ])
  } catch (e) {
    console.error('no pude registrar auditoria:', e.message)
  }
}
