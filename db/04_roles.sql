-- Eliminar en caso de que ya haya sido creado el usuario.
DROP USER IF EXISTS biblioteca_admin;

-- Crear el usuario.
CREATE USER biblioteca_admin WITH PASSWORD '243715_biblioteca_admin';

-- Dar permisos para que pueda usar nuestra base de datos
GRANT CONNECT ON DATABASE biblioteca TO biblioteca_admin;
-- Dar permisos para que pueda usar el esquema public
GRANT USAGE ON SCHEMA public TO biblioteca_admin;

-- Dar permisos para que SOLO pueda consultar las vistas
GRANT SELECT ON vw_libros_mas_prestados TO biblioteca_admin;
GRANT SELECT ON vw_prestamos_vencidos TO biblioteca_admin;
GRANT SELECT ON vw_resumen_multas TO biblioteca_admin;
GRANT SELECT ON vw_actividad_socios TO biblioteca_admin;
GRANT SELECT ON vw_salud_inventario TO biblioteca_admin;

-- Quitar permiso a las demás tablas
REVOKE ALL ON TABLE socios FROM biblioteca_admin;
REVOKE ALL ON TABLE libros FROM biblioteca_admin;
REVOKE ALL ON TABLE copias FROM biblioteca_admin;
REVOKE ALL ON TABLE prestamos FROM biblioteca_admin;
REVOKE ALL ON TABLE multas FROM biblioteca_admin;

-- Quitar permiso al grupo public
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM public;

/*
El usuario biblioteca_admin no tiene permisos 
mas que solo poder consultar las vistas ya creadas
*/