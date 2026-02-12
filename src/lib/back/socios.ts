import pool from '@/lib/db';

export interface Socio {
    id: number;
    nombre: string;
    tipo_membresia: string;
    total_prestamos: string;
    devoluciones_tardias: string;
    tasa_morosidad_porcentaje: string;
}

export async function obtenerSocios(search?: string, page: number = 1) {
    const client = await pool.connect();
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        const searchPattern = `%${search || ''}%`;

        const dataQuery = `
      SELECT * FROM vw_actividad_socios 
      WHERE nombre ILIKE $1 OR tipo_membresia ILIKE $1
      ORDER BY tasa_morosidad_porcentaje DESC, total_prestamos DESC
      LIMIT $2 OFFSET $3
    `;

        const countQuery = `
      SELECT COUNT(*) as total FROM vw_actividad_socios 
      WHERE nombre ILIKE $1 OR tipo_membresia ILIKE $1
    `;

        const [dataResult, countResult] = await Promise.all([
            client.query(dataQuery, [searchPattern, limit, offset]),
            client.query(countQuery, [searchPattern])
        ]);

        return {
            socios: dataResult.rows as Socio[],
            total: parseInt(countResult.rows[0].total)
        };
    } finally {
        client.release();
    }
}
