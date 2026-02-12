import pool from '@/lib/db';

export interface Multa {
    mes: string;
    cantidad_multas: string;
    total_cobrado: string;
    deuda_pendiente: string;
    total_multas: string;
}

export async function obtenerDatosMultas(start?: string, end?: string) {
    const client = await pool.connect();
    try {
        let query = 'SELECT * FROM vw_resumen_multas';
        const params: string[] = [];

        if (start && end) {
            query += ' WHERE mes >= $1 AND mes <= $2';
            params.push(start, end);
        }

        query += ' ORDER BY mes DESC LIMIT 12';

        const result = await client.query(query, params);
        return result.rows as Multa[];
    } finally {
        client.release();
    }
}
