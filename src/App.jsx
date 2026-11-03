import { useEffect, useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const COLORES = ['#2F6FDE', '#E07B39', '#2A9D8F', '#8E5BD8', '#D6446B', '#8C9A2E']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
// eje Y corto: millones si es grande, miles si es chico (asi no se repiten las etiquetas)
const corto = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.round(v / 1e3) + 'k')
const clp = (n) => '$' + Math.round(n).toLocaleString('es-CL')

// suma los montos agrupando por lo que me pidan (categoria, region, mes)
function agrupar(filas, clave) {
  const m = new Map()
  filas.forEach((f) => m.set(clave(f), (m.get(clave(f)) || 0) + f.monto))
  return [...m].map(([name, value]) => ({ name, value }))
}

export default function App() {
  const [opciones, setOpciones] = useState({ categorias: [], regiones: [] })
  const [cats, setCats] = useState([])
  const [regs, setRegs] = useState([])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [filas, setFilas] = useState([])
  const [sel, setSel] = useState(new Set())
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  // opciones de los filtros (una sola vez)
  useEffect(() => {
    fetch('/api/opciones').then((r) => r.json()).then(setOpciones).catch(() => setError('No pude cargar los filtros'))
  }, [])

  // cada vez que cambia un filtro pido los datos de nuevo a la API
  useEffect(() => {
    const q = new URLSearchParams()
    if (cats.length) q.set('categoria', cats.join(','))
    if (regs.length) q.set('region', regs.join(','))
    if (desde) q.set('desde', desde)
    if (hasta) q.set('hasta', hasta)
    setCargando(true)
    fetch('/api/movimientos?' + q)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setFilas(d); setSel(new Set()); setError('') })
      .catch(() => setError('No pude cargar los movimientos'))
      .finally(() => setCargando(false))
  }, [cats, regs, desde, hasta])

  // si hay filas seleccionadas los graficos usan solo esas, si no usan todas las filtradas
  const base = useMemo(() => (sel.size ? filas.filter((f) => sel.has(f.id)) : filas), [filas, sel])

  const porCategoria = useMemo(() => agrupar(base, (f) => f.categoria), [base])
  const porRegion = useMemo(() => agrupar(base, (f) => f.region), [base])
  const porMes = useMemo(() => {
    const m = agrupar(base, (f) => Number(f.fecha.slice(5, 7)) - 1).sort((a, b) => a.name - b.name)
    return m.map((x) => ({ name: MESES[x.name], value: x.value }))
  }, [base])

  const total = base.reduce((a, f) => a + f.monto, 0)

  const alternar = (lista, set, v) => set(lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v])
  const alternarFila = (id) => {
    const n = new Set(sel)
    n.has(id) ? n.delete(id) : n.add(id)
    setSel(n)
  }
  const todasSel = filas.length > 0 && sel.size === filas.length

  return (
    <main>
      <header>
        <h1>Dashboard de movimientos</h1>
        <p>{sel.size ? `Graficando ${sel.size} movimientos seleccionados` : `Graficando los ${filas.length} movimientos filtrados`}</p>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="filtros">
        <div>
          <h3>Categoría</h3>
          {opciones.categorias.map((c) => (
            <button key={c} className={cats.includes(c) ? 'chip on' : 'chip'} onClick={() => alternar(cats, setCats, c)}>{c}</button>
          ))}
        </div>
        <div>
          <h3>Región</h3>
          {opciones.regiones.map((r) => (
            <button key={r} className={regs.includes(r) ? 'chip on' : 'chip'} onClick={() => alternar(regs, setRegs, r)}>{r}</button>
          ))}
        </div>
        <div className="fechas">
          <label>Desde <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
          <label>Hasta <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          <button className="chip" onClick={() => { setCats([]); setRegs([]); setDesde(''); setHasta('') }}>Limpiar filtros</button>
        </div>
      </section>

      <section className="kpis">
        <div><span>Total</span><b>{clp(total)}</b></div>
        <div><span>Movimientos</span><b>{base.length}</b></div>
        <div><span>Promedio</span><b>{base.length ? clp(total / base.length) : '-'}</b></div>
      </section>

      <section className="graficos">
        <div className="card">
          <h3>Gasto por categoría</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={porCategoria} dataKey="value" nameKey="name" outerRadius={95} label={({ percent }) => `${Math.round(percent * 100)}%`}>
                {porCategoria.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Pie>
              <Tooltip formatter={clp} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Evolución por mes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={porMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={corto} />
              <Tooltip formatter={clp} />
              <Line type="monotone" dataKey="value" name="Monto" stroke="#2F6FDE" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Gasto por región</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={corto} />
              <Tooltip formatter={clp} />
              <Bar dataKey="value" name="Monto" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card tabla">
        <div className="tabla-top">
          <h3>Movimientos {cargando && '(cargando...)'}</h3>
          <div>
            <button className="chip" onClick={() => setSel(new Set(filas.map((f) => f.id)))}>Seleccionar todos ({filas.length})</button>
            <button className="chip" onClick={() => setSel(new Set())}>Quitar selección</button>
          </div>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" checked={todasSel} onChange={() => setSel(todasSel ? new Set() : new Set(filas.map((f) => f.id)))} /></th>
                <th>Fecha</th><th>Categoría</th><th>Región</th><th>Comercio</th><th className="der">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className={sel.has(f.id) ? 'marcada' : ''} onClick={() => alternarFila(f.id)}>
                  <td><input type="checkbox" checked={sel.has(f.id)} onChange={() => alternarFila(f.id)} onClick={(e) => e.stopPropagation()} /></td>
                  <td>{f.fecha}</td><td>{f.categoria}</td><td>{f.region}</td><td>{f.comercio}</td><td className="der">{clp(f.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
