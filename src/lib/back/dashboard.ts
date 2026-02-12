import pool from '@/lib/db';

export async function obtenerDatosDashboard() {
    const client = await pool.connect();
    try {
        const fines = await client.query('SELECT SUM(deuda_pendiente) as total FROM vw_resumen_multas');
        const overdue = await client.query('SELECT COUNT(*) as total FROM vw_prestamos_vencidos');
        const topBook = await client.query('SELECT titulo, total_prestamos FROM vw_libros_mas_prestados LIMIT 1');
        const members = await client.query('SELECT COUNT(*) as total FROM vw_actividad_socios');
        const inventory = await client.query('SELECT AVG(porcentaje_ocupacion) as avg FROM vw_salud_inventario');

        return {
            totalFines: parseFloat(fines.rows[0]?.total || '0'),
            overdueLoans: parseInt(overdue.rows[0]?.total || '0'),
            topBook: topBook.rows[0]?.titulo || 'N/A',
            topBookLoans: parseInt(topBook.rows[0]?.total_prestamos || '0'),
            totalMembers: parseInt(members.rows[0]?.total || '0'),
            inventoryHealth: parseFloat(inventory.rows[0]?.avg || '0'),
        };
    } finally {
        client.release();
    }
}
