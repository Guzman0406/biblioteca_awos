import pool from '@/lib/db';

export interface Inventario {
    categoria: string;
    total_items: string;
    stock_disponible: string;
    en_circulacion: string;
    no_disponibles: string;
    porcentaje_ocupacion: string;
}

export async function obtenerInventario() {
    const client = await pool.connect();

    try {
        const query = `
      SELECT * FROM vw_salud_inventario 
      ORDER BY porcentaje_ocupacion DESC
    `;

        const result = await client.query(query);
        return result.rows as Inventario[];
    } finally {
        client.release();
    }
}
