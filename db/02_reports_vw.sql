/* VIEW 1: Libros más prestados en ranking
Metrica: Uso de Rank() + Count()
Grain: Una fila por libro
Lógica: Hace un ranking de los id de los libros más repetidos 
en la tabla prestamos.

Resultado:   id |                      titulo                      |          autor          | total_prestamos | ranking | popularidad 
----+--------------------------------------------------+-------------------------+-----------------+---------+-------------
  2 | Clean Code                                       | Robert C. Martin        |               3 |       1 | Regular
  9 | Harry Potter y la Piedra Filosofal               | J.K. Rowling            |               3 |       1 | Regular
  1 | Cien Años de Soledad                            | Gabriel Garcia Marquez  |               2 |       3 | Regular
  5 | Dune                                             | Frank Herbert           |               1 |       4 | Regular
(4 rows)

*/
CREATE OR REPLACE VIEW vw_libros_mas_prestados AS
SELECT
    l.id,
    l.titulo,
    l.autor,
    COUNT(p.id) AS total_prestamos,
    RANK() OVER (ORDER BY COUNT(p.id) DESC) AS ranking,
    CASE 
        WHEN COUNT(p.id) > 5 THEN 'Popular'
        ELSE 'Regular'
    END AS popularidad
FROM libros l
JOIN copias c ON l.id = c.libro_id
LEFT JOIN prestamos p ON c.id = p.copia_id
GROUP BY l.id, l.titulo, l.autor
HAVING COUNT(p.id) > 0
ORDER BY ranking ASC;


/* VIEW 2: Prestamos vencidos con dias de atraso y monto sugerido
Metrica: Uso de CTE + CASE
Grain: Una fila por prestamo
Lógica: Primero se calculan los dias de atraso, luego se aplica
un costo por dia de atraso

Resultado: 
 prestamo_id |     socio     |         email         |        libro         | dias_atraso | multa_sugerida 
-------------+---------------+---------------+-----------------------+-------------+----------------
           6 | Maria Garcia  | maria.g@email.com    | Cien Años de Soledad|          10 |          50.00
           7 | Juan Perez    | juan.perez@email.com | Clean Code          |           5 |          25.00
           8 | Carlos Lopez  | carlos.l@email.com   | Dune                |          20 |          90.00
(3 rows)
*/
CREATE OR REPLACE VIEW vw_prestamos_vencidos AS
WITH calculo_atraso AS (
    SELECT
        p.id AS prestamo_id,
        s.nombre AS socio,
        s.email, 
        l.titulo AS libro,
        p.fecha_limite,
        CURRENT_DATE - DATE(p.fecha_limite) AS dias_atraso
    FROM prestamos p
    JOIN socios s ON p.socio_id = s.id
    JOIN copias c ON p.copia_id = c.id
    JOIN libros l ON c.libro_id = l.id
    WHERE p.fecha_devolucion IS NULL  -- No se ha devuelto
    AND p.fecha_limite < CURRENT_DATE  -- Ya venció
)
SELECT 
    prestamo_id,
    socio,
    email,
    libro,
    fecha_limite,
    dias_atraso,
    CASE 
        WHEN dias_atraso <= 3 THEN 0.00
        WHEN dias_atraso <= 10 THEN dias_atraso * 5.00
        ELSE 50.00 + (dias_atraso * 2.00)
    END AS multa_sugerida
FROM calculo_atraso
ORDER BY dias_atraso DESC;


/* VIEW 3: Resumen mensual de multas pagadas/pendientes 
Metrica: Uso de Having para los meses con actividad de multas
Grain: Una fila por mes
Lógica: Primero se agrupa por mes, luego se filtran los 
meses con actividad de multas

Resultado:
   mes    | cantidad_multas | total_cobrado | deuda_pendiente | total_multas 
----------+-----------------+---------------+-----------------+--------------
 2024-03  |               4 |         50.00 |          140.50 |       190.50
(1 row)
*/
CREATE OR REPLACE VIEW vw_resumen_multas AS
SELECT 
    TO_CHAR(p.fecha_prestamo, 'YYYY-MM') AS mes,
    COUNT(m.id) AS cantidad_multas,
    SUM(CASE WHEN m.fecha_pago IS NOT NULL THEN m.monto ELSE 0 END) AS total_cobrado,
    SUM(CASE WHEN m.fecha_pago IS NULL THEN m.monto ELSE 0 END) AS deuda_pendiente,
    SUM(m.monto) AS total_multas
FROM multas m
JOIN prestamos p ON m.prestamo_id = p.id
GROUP BY TO_CHAR(p.fecha_prestamo, 'YYYY-MM')
HAVING SUM(m.monto) > 0  
ORDER BY mes DESC;


/* VIEW 4 Socios activos y tasa de atraso
Metrica:Uso de Having para los socios con actividad de prestamos, Coalesce para evitar division por cero
Grain: Una fila por socio
Lógica: Primero se calculan los prestamos por socio, luego se 
calcula la tasa de morosidad:
(devoluciones tardias / total prestamos) * 100

Resultado:
 id |    nombre     | tipo_membresia | total_prestamos | devoluciones_tardias | tasa_morosidad_porcentaje 
----+---------------+----------------+-----------------+----------------------+---------------------------
  1 | Juan Perez    | Profesor       |               3 |                    2 |                     66.67
  2 | Maria Garcia  | Estudiante     |               2 |                    1 |                     50.00
  3 | Carlos Lopez  | VIP            |               2 |                    2 |                    100.00
  4 | Ana Torres    | Estudiante     |               1 |                    0 |                      0.00
  5 | Luis Diaz     | Cliente        |               1 |                    0 |                      0.00
(5 rows)
*/
CREATE OR REPLACE VIEW vw_actividad_socios AS
SELECT 
    s.id,
    s.nombre,
    s.tipo_membresia,
    COUNT(p.id) as total_prestamos,
    COUNT(CASE 
        WHEN p.fecha_devolucion > p.fecha_limite THEN 1 
    END) as devoluciones_tardias,
    COALESCE(
        ROUND(
            (COUNT(CASE 
                WHEN p.fecha_devolucion > p.fecha_limite THEN 1 
            END)::DECIMAL / NULLIF(COUNT(p.id), 0)) * 100, 
        2), 
    0) as tasa_morosidad_porcentaje
FROM socios s
LEFT JOIN prestamos p ON s.id = p.socio_id
GROUP BY s.id, s.nombre, s.tipo_membresia
HAVING COUNT(p.id) > 0; 


/* VIEW 5: Salud de inventario por categoría (disponibles, prestados, perdidos).
Metrica: Uso de CASE para estados, Coalesce para evitar division por cero
Grain: Una fila por categoría
Lógica: Primero se calculan los prestamos por categoria, luego se 
calcula la tasa de ocupacion:
(prestamos / total items) * 100

Resultado:
   categoria    | total_items | stock_disponible | en_circulacion | no_disponibles | porcentaje_ocupacion 
----------------+-------------+------------------+----------------+----------------+---------------------
 Autoayuda      |           1 |                0 |              0 |              1 |                 0.0
 Biografía      |           1 |                0 |              0 |              0 |                 0.0
 Ciencia Ficción|           2 |                1 |              1 |              0 |                50.0
 Clásico        |           1 |                0 |              0 |              0 |                 0.0
 Educación      |           1 |                0 |              0 |              1 |                 0.0
 Fantasía       |           4 |                1 |              3 |              0 |                75.0
 Historia       |           1 |                0 |              0 |              0 |                 0.0
 Infantil       |           1 |                1 |              0 |              0 |                 0.0
 Novela         |           2 |                1 |              1 |              0 |                50.0
 Tecnología     |           2 |                0 |              2 |              0 |               100.0
(10 rows)
*/

CREATE OR REPLACE VIEW vw_salud_inventario AS
SELECT 
    l.categoria,
    COUNT(c.id) AS total_items,
    COUNT(CASE WHEN c.estado = 'Disponible' THEN 1 END) AS stock_disponible,
    COUNT(CASE WHEN c.estado = 'Prestado' THEN 1 END) AS en_circulacion,
    COUNT(CASE WHEN c.estado IN ('Perdido', 'Mantenimiento') THEN 1 END) AS no_disponibles,
    COALESCE(
        ROUND(
            (COUNT(CASE WHEN c.estado = 'Prestado' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(c.id), 0)) * 100, 
        1), 
    0) AS porcentaje_ocupacion
FROM libros l
JOIN copias c ON l.id = c.libro_id  
GROUP BY l.categoria
ORDER BY l.categoria;