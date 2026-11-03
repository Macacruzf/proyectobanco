import { pool } from './_db.js'

// GET /api/movimientos?categoria=Comida,Salud&region=Norte&desde=2025-01-01&hasta=2025-12-31
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Solo GET' })

  try {
    const { categoria, region, desde, hasta } = req.query
    const where = []
    const vals = []

    // armo el WHERE solo con los filtros que llegaron (siempre con parametros, nada de concatenar)
    if (categoria) {
      vals.push(categoria.split(','))
      where.push(`categoria = ANY($${vals.length})`)
    }
    if (region) {
      vals.push(region.split(','))
      where.push(`region = ANY($${vals.length})`)
    }
    if (desde) {
      vals.push(desde)
      where.push(`fecha >= $${vals.length}`)
    }
    if (hasta) {
      vals.push(hasta)
      where.push(`fecha <= $${vals.length}`)
    }

    const sql = `SELECT id, to_char(fecha,'YYYY-MM-DD') AS fecha, categoria, region, comercio, monto::float AS monto
                 FROM movimientos
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY fecha DESC, id DESC
                 LIMIT 2000`
    const { rows } = await pool.query(sql, vals)
    res.status(200).json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al consultar la base de datos' })
  }
}
