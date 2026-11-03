import pg from 'pg'

// pool unico, se reusa entre llamadas de la funcion
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
const local = /localhost|127\.0\.0\.1/.test(url || '')

export const pool = new pg.Pool({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
  max: 3,
})
