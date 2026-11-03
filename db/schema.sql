-- tabla principal del dashboard
CREATE TABLE IF NOT EXISTS movimientos (
  id        SERIAL PRIMARY KEY,
  fecha     DATE          NOT NULL,
  categoria VARCHAR(40)   NOT NULL,
  region    VARCHAR(40)   NOT NULL,
  comercio  VARCHAR(80)   NOT NULL,
  monto     NUMERIC(12,2) NOT NULL CHECK (monto > 0)
);

-- indices para que filtrar por fecha y categoria sea rapido
CREATE INDEX IF NOT EXISTS idx_mov_fecha ON movimientos (fecha);
CREATE INDEX IF NOT EXISTS idx_mov_categoria ON movimientos (categoria);

-- usuarios para el login (la clave se guarda con hash, nunca en texto plano)
CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  usuario    VARCHAR(40)  NOT NULL UNIQUE,
  clave_hash VARCHAR(100) NOT NULL
);

-- auditoria: quien hizo que y cuando (login, intentos fallidos, consultas)
CREATE TABLE IF NOT EXISTS auditoria (
  id      SERIAL PRIMARY KEY,
  fecha   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  usuario VARCHAR(40),
  accion  VARCHAR(30)  NOT NULL,   -- login_ok, login_fallido, bloqueado, consulta
  detalle VARCHAR(300),
  ip      VARCHAR(60)              -- solo en eventos de login (para el bloqueo)
);
CREATE INDEX IF NOT EXISTS idx_aud_login ON auditoria (accion, ip, fecha);
