// crea la tabla y mete 300 movimientos de ejemplo: node scripts/seed.js
import fs from 'node:fs'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) throw new Error('Falta DATABASE_URL')
const local = /localhost|127\.0\.0\.1/.test(url)
const claveAdmin = process.env.ADMIN_PASSWORD
if (!claveAdmin || claveAdmin.length < 8) throw new Error('Falta ADMIN_PASSWORD (minimo 8 caracteres)')
const client = new pg.Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } })

const categorias = ['Alimentación', 'Transporte', 'Salud', 'Educación', 'Entretención', 'Servicios']
const regiones = ['Norte', 'Centro', 'Sur', 'Metropolitana']
const comercios = ['Lider', 'Jumbo', 'Copec', 'Farmacia Ahumada', 'Cinemark', 'Entel', 'Falabella', 'Uber']

// generador con semilla para que los datos siempre sean los mismos
let s = 42
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (a) => a[Math.floor(rnd() * a.length)]

await client.connect()
await client.query(fs.readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'))
await client.query('TRUNCATE movimientos RESTART IDENTITY')

for (let i = 0; i < 300; i++) {
  const mes = Math.floor(rnd() * 12)
  const dia = 1 + Math.floor(rnd() * 28)
  const fecha = `2025-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  const monto = Math.round((5000 + rnd() * 195000) / 10) * 10
  await client.query(
    'INSERT INTO movimientos (fecha, categoria, region, comercio, monto) VALUES ($1,$2,$3,$4,$5)',
    [fecha, pick(categorias), pick(regiones), pick(comercios), monto],
  )
}

// usuario admin (si ya existe le actualizo la clave)
await client.query(
  `INSERT INTO usuarios (usuario, clave_hash) VALUES ('admin', $1)
   ON CONFLICT (usuario) DO UPDATE SET clave_hash = EXCLUDED.clave_hash`,
  [await bcrypt.hash(claveAdmin, 10)],
)

const { rows } = await client.query('SELECT COUNT(*) FROM movimientos')
console.log('Listo, movimientos en la tabla:', rows[0].count)
await client.end()
