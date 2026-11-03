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
