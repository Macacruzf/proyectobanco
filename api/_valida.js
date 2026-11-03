// validaciones de entrada: todo lo que llega por la URL se revisa antes de tocar la base

const TEXTO = /^[\p{L}\p{N} _.-]{1,40}$/u
const FECHA = /^\d{4}-\d{2}-\d{2}$/

// lista separada por comas -> arreglo limpio (max 10 elementos), o null si algo viene raro
export function lista(valor) {
  if (valor === undefined || valor === '') return []
  if (typeof valor !== 'string') return null
  const items = valor.split(',')
  if (items.length > 10 || !items.every((x) => TEXTO.test(x))) return null
  return items
}

// fecha AAAA-MM-DD que exista de verdad (rechaza 2025-02-31)
export function fecha(valor) {
  if (valor === undefined || valor === '') return ''
  if (typeof valor !== 'string' || !FECHA.test(valor)) return null
  const d = new Date(valor + 'T00:00:00Z')
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== valor ? null : valor
}
