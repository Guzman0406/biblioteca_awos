import pool from '@/lib/db';

export interface LibroPopular {
    id: number;
    titulo: string;
    autor: string;
    total_prestamos: string;
    ranking: string;
}

export async function obtenerLibrosPopulares(search?: string, page: number = 1) {
    const client = await pool.connect();
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        const searchPattern = `%${search || ''}%`;

        const dataQuery = `
      SELECT * FROM vw_libros_mas_prestados 
      WHERE titulo ILIKE $1 OR autor ILIKE $1
      ORDER BY ranking ASC
      LIMIT $2 OFFSET $3
    `;

        const countQuery = `
      SELECT COUNT(*) as total FROM vw_libros_mas_prestados 
      WHERE titulo ILIKE $1 OR autor ILIKE $1
    `;

        const [dataResult, countResult] = await Promise.all([
            client.query(dataQuery, [searchPattern, limit, offset]),
            client.query(countQuery, [searchPattern])
        ]);

        return {
            libros: dataResult.rows as LibroPopular[],
            total: parseInt(countResult.rows[0].total)
        };
    } finally {
        client.release();
    }
}
