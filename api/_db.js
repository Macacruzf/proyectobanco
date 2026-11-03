import pg from 'pg'

// pool unico, se reusa entre llamadas de la funcion
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
const local = /localhost|127\.0\.0\.1/.test(url || '')

export const pool = new pg.Pool({
  connectionString: url,
  // en la nube valido el certificado del servidor (DB_SSL_INSECURE=1 solo si algo falla y mientras se arregla)
  ssl: local ? false : { rejectUnauthorized: process.env.DB_SSL_INSECURE !== '1' },
  max: 3,
})
