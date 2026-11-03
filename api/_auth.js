import jwt from 'jsonwebtoken'

// revisa el token del header "Authorization: Bearer <token>"
// devuelve el usuario si esta ok, si no responde 401 y devuelve null
export function verificar(req, res) {
  const secreto = process.env.JWT_SECRET
  if (!secreto) {
    res.status(500).json({ error: 'Falta configurar JWT_SECRET en el servidor' })
    return null
  }

  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  try {
    return jwt.verify(token, secreto, { algorithms: ['HS256'] }) // solo acepto HS256
  } catch {
    res.status(401).json({ error: 'Token invalido o vencido' })
    return null
  }
}
