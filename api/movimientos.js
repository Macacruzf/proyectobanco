import { pool } from './_db.js'
import { verificar } from './_auth.js'
import { lista, fecha } from './_valida.js'
import { registrar } from './_log.js'

// GET /api/movimientos?categoria=Salud,Transporte&region=Norte&desde=2025-01-01&hasta=2025-12-31
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Solo GET' })

  const user = verificar(req, res)
  if (!user) return // sin token valido no pasa

  // reviso todo lo que llega antes de armar el SQL
  const categorias = lista(req.query.categoria)
  const regiones = lista(req.query.region)
  const desde = fecha(req.query.desde)
  const hasta = fecha(req.query.hasta)
  if (categorias === null || regiones === null || desde === null || hasta === null) {
    return res.status(400).json({ error: 'Parametros invalidos' })
  }
  if (desde && hasta && desde > hasta) return res.status(400).json({ error: 'La fecha desde es mayor que hasta' })

  try {
    const where = []
    const vals = []
    // armo el WHERE solo con los filtros que llegaron (siempre con parametros, nada de concatenar)
    if (categorias.length) { vals.push(categorias); where.push(`categoria = ANY($${vals.length})`) }
    if (regiones.length) { vals.push(regiones); where.push(`region = ANY($${vals.length})`) }
    if (desde) { vals.push(desde); where.push(`fecha >= $${vals.length}`) }
    if (hasta) { vals.push(hasta); where.push(`fecha <= $${vals.length}`) }

    // solo las columnas que el dashboard necesita (minimo de datos)
    const sql = `SELECT id, to_char(fecha,'YYYY-MM-DD') AS fecha, categoria, region, comercio, monto::float AS monto
                 FROM movimientos
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY fecha DESC, id DESC
                 LIMIT 2000`
    const { rows } = await pool.query(sql, vals)

    await registrar('consulta', user.usuario, `filas=${rows.length} cat=${categorias.join('|')} reg=${regiones.join('|')} ${desde}..${hasta}`)
    res.status(200).json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al consultar la base de datos' })
  }
}
