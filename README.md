# Sistema de Reportes de Biblioteca (Evaluación Práctica)

Este proyecto se trata de una aplicación web creada con **Next.js** que visualiza reportes los cuales son obtenidos de **Vistas SQL** en una base de datos. Todo esto contenido dentro de **Docker Compose**.

## Ejecución

Para levantar la base de datos y la aplicación con un solo comando:

```bash
docker compose up --build
```

La aplicación estará disponible en: `http://localhost:3001`

---

### Contexto de la Aplicación
Se trata de unDashboard para la gestión de una biblioteca: préstamos, morosidad, multas, usuarios activos e inventario.

### A) Base de Datos
* Consta de 5 tablas principales (socios, libros, copias, prestamos, multas).
*   **Seed**: Datos de prueba generados automáticamente al iniciar el contenedor.

### B) Vistas SQL (`db/reports_vw.sql`)
Se implementaron 5 vistas maestras cumpliendo los requisitos técnicos:

1.  **`vw_libros_mas_prestados`** (Ranking Popularidad)
    *   *Metricas*: `COUNT`, `RANK` (Window Function).
    *   *Uso*: Identifica tendencias de lectura con los libros mas prestados.
2.  **`vw_prestamos_vencidos`** (Morosidad)
    *   *Metricas*: `CTE` (Common Table Expression), `CASE` para cálculo de días atraso y multas.
    *   *Uso*: Gestión de cobranza y recuperación del dinero por prestamos vencidos.
3.  **`vw_resumen_multas`** (Financiero)
    *   *Metricas*: `SUM`, `HAVING` para filtrar deudas significativas.
    *   *Uso*: Cuentas por cobrar.
4.  **`vw_actividad_socios`** (Comunidad)
    *   *Metricas*: `HAVING`, `COALESCE` para manejar nulos en devoluciones.
    *   *Uso*: Detección de usuarios "VIP" y riesgosos.
5.  **`vw_salud_inventario`** (Inventario)
    *   *Metricas*: `CASE` para estados de libros, `AVG` para métricas de salud.
    *   *Uso*: Planificación de adquisiciones y mantenimiento.

### C) Índices (`db/indexes.sql`)
*   Índices en columnas de búsqueda (`titulo`, `autor` en libros).
*   Índices en llaves foráneas y estados (`status` en copias).

**Evidencia de Índices (EXPLAIN):**

> *Nota: Debido a que tenemos pocos registros, el EXPLAIN de Postgres puede optar por `Seq Scan` en lugar de `Index Scan`, aunque los índices existan.*

1. **Búsqueda por Título** (`idx_libros_titulo`):
   ```sql
   EXPLAIN ANALYZE SELECT * FROM libros WHERE titulo = 'Cien años de soledad';
   ```
   **Salida:**
   ```
   Seq Scan on libros  (cost=0.00..1.15 rows=1 width=616) (actual time=0.103..0.104 rows=0 loops=1)
     Filter: ((titulo)::text = 'Cien años de soledad'::text)
     Rows Removed by Filter: 12
   Planning Time: 3.601 ms
   Execution Time: 0.554 ms
   ```

2. **Filtro de Vencimiento** (`idx_prestamos_fecha_limite`):
   ```sql
   EXPLAIN ANALYZE SELECT * FROM prestamos WHERE fecha_limite < NOW();
   ```
   **Salida:**
   ```
   Seq Scan on prestamos  (cost=0.00..1.12 rows=3 width=36) (actual time=0.288..0.294 rows=6 loops=1)
     Filter: (fecha_limite < now())
     Rows Removed by Filter: 2
   Planning Time: 2.743 ms
   Execution Time: 0.475 ms
   ```

### D) Next.js Dashboard
* 
    *   `/` (Dashboard Principal): Navegación a reportes.
    *   `/reports/popular-books`: Ranking de libros más prestados con filtros.
    *   `/reports/overdue`: Listado de prestamos vencidos con cálculo de deuda.
    *   `/reports/fines`: Resumen de multas pagadas/pendientes.
    *   `/reports/members`: Análisis de socios.
    *   `/reports/inventory`: Estado del acervo.
