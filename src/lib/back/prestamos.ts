import pool from '@/lib/db';

export interface PrestamoVencido {
    prestamo_id: number;
    socio: string;
    email: string;
    libro: string;
    fecha_limite: Date;
    dias_atraso: number;
    multa_sugerida: string;
}

export async function obtenerPrestamosVencidos(search?: string, page: number = 1) {
    const client = await pool.connect();
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        const searchPattern = `%${search || ''}%`;

        const dataQuery = `
      SELECT * FROM vw_prestamos_vencidos 
      WHERE socio ILIKE $1 OR libro ILIKE $1
      ORDER BY dias_atraso DESC
      LIMIT $2 OFFSET $3
    `;

        const countQuery = `
      SELECT COUNT(*) as total, SUM(multa_sugerida) as deuda_total 
      FROM vw_prestamos_vencidos 
      WHERE socio ILIKE $1 OR libro ILIKE $1
    `;

        const [dataResult, countResult] = await Promise.all([
            client.query(dataQuery, [searchPattern, limit, offset]),
            client.query(countQuery, [searchPattern])
        ]);

        return {
            prestamos: dataResult.rows as PrestamoVencido[],
            total: parseInt(countResult.rows[0].total),
            deudaTotal: parseFloat(countResult.rows[0].deuda_total || '0')
        };
    } finally {
        client.release();
    }
}
