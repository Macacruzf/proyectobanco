-- usuario de la API con minimo privilegio: solo lee datos y escribe auditoria
-- ejecutar con el usuario administrador de la base, DESPUES de npm run seed
-- cambia CAMBIAR_ESTA_CLAVE y el nombre de la base (neondb) si el tuyo es otro
CREATE ROLE app_api LOGIN PASSWORD 'CAMBIAR_ESTA_CLAVE';
GRANT CONNECT ON DATABASE neondb TO app_api;
GRANT USAGE ON SCHEMA public TO app_api;
GRANT SELECT ON movimientos, usuarios TO app_api;
GRANT SELECT, INSERT ON auditoria TO app_api;
GRANT USAGE ON SEQUENCE auditoria_id_seq TO app_api;
-- no tiene UPDATE, DELETE ni DROP: si alguien roba esta clave no puede modificar ni borrar datos
