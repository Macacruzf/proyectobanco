import { useState } from 'react'

// pantalla de login: manda usuario y clave a /api/login y devuelve el token
export default function Login({ onOk }) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const entrar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'No pude iniciar sesión')
      onOk(d.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <form className="card" onSubmit={entrar}>
        <h1>Iniciar sesión</h1>
        <label>Usuario<input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required /></label>
        <label>Clave<input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" required /></label>
        {error && <div className="error">{error}</div>}
        <button className="chip on" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </main>
  )
}
