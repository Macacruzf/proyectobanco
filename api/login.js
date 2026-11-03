import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from './_db.js'
import { ipDe, registrar } from './_log.js'

const MAX_INTENTOS = 5 // fallos permitidos
const VENTANA_MIN = 15 // en estos minutos

// POST /api/login  body: { "usuario": "admin", "clave": "..." }  ->  { token, expiraEn }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' })

  const secreto = process.env.JWT_SECRET
  if (!secreto) return res.status(500).json({ error: 'Falta configurar JWT_SECRET en el servidor' })

  const { usuario, clave } = req.body || {}
  if (typeof usuario !== 'string' || typeof clave !== 'string' || !usuario || !clave || usuario.length > 40 || clave.length > 100) {
    return res.status(400).json({ error: 'Faltan usuario o clave' })
  }

  const ip = ipDe(req)
  try {
    // si esta ip fallo muchas veces hace poco, la bloqueo un rato (frena adivinar claves)
    const { rows: fallos } = await pool.query(
      `SELECT COUNT(*)::int AS n FROM auditoria
       WHERE accion = 'login_fallido' AND ip = $1 AND fecha > now() - ($2 || ' minutes')::interval`,
      [ip, String(VENTANA_MIN)],
    )
    if (fallos[0].n >= MAX_INTENTOS) {
      await registrar('bloqueado', usuario, 'demasiados intentos', ip)
      return res.status(429).json({ error: `Demasiados intentos. Espera ${VENTANA_MIN} minutos.` })
    }

    const { rows } = await pool.query('SELECT id, usuario, clave_hash FROM usuarios WHERE usuario = $1', [usuario])
    // siempre comparo el hash (aunque no exista el usuario) para no dar pistas de cual fallo
    const hash = rows[0]?.clave_hash || '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinva'
    const ok = await bcrypt.compare(clave, hash)
    if (!rows[0] || !ok) {
      await registrar('login_fallido', usuario, null, ip)
      return res.status(401).json({ error: 'Credenciales invalidas' })
    }

    const token = jwt.sign({ sub: rows[0].id, usuario: rows[0].usuario }, secreto, { expiresIn: '1h' })
    await registrar('login_ok', rows[0].usuario, null, ip)
    res.status(200).json({ token, expiraEn: 3600 })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}
