import { pool } from './_db.js'
import { verificar } from './_auth.js'

// GET /api/opciones -> categorias y regiones que existen, para armar los filtros
export default async function handler(req, res) {
  if (!verificar(req, res)) return // sin token valido no pasa

  try {
    const cats = await pool.query('SELECT DISTINCT categoria FROM movimientos ORDER BY 1')
    const regs = await pool.query('SELECT DISTINCT region FROM movimientos ORDER BY 1')
    res.status(200).json({
      categorias: cats.rows.map((r) => r.categoria),
      regiones: regs.rows.map((r) => r.region),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al consultar la base de datos' })
  }
}
