import Link from 'next/link';
import { obtenerInventario } from '@/lib/back/inventario';

export default async function PaginaInventario() {
    const inventario = await obtenerInventario();


    let totalItems = 0;
    let totalCirculacion = 0;

    inventario.forEach(cat => {
        totalItems += parseInt(cat.total_items);
        totalCirculacion += parseInt(cat.en_circulacion);
    });

    const ocupacionGlobal = totalItems > 0
        ? ((totalCirculacion / totalItems) * 100).toFixed(1)
        : '0';

    return (
        <div className="container">
            <div className="header">
                <Link href="/" className="back-link">← Volver al Dashboard</Link>
                <h1>Salud del Inventario</h1>
                <p>Estado actual</p>
            </div>


            <div className="kpi-grid">
                <div className="kpi-card">
                    <h3>Total de Libros</h3>
                    <p className="kpi-value">{totalItems}</p>
                </div>
                <div className="kpi-card">
                    <h3>En Circulación</h3>
                    <p className="kpi-value">{totalCirculacion}</p>
                </div>
                <div className="kpi-card">
                    <h3>Ocupación</h3>
                    <p className="kpi-value">{ocupacionGlobal}%</p>
                </div>
            </div>


            <div className="table-container">
                <h2> Categorías</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Total Items</th>
                            <th>Disponibles</th>
                            <th>En Circulación</th>
                            <th>No Disponibles</th>
                            <th>Ocupación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventario.map(cat => (
                            <tr key={cat.categoria}>
                                <td><strong>{cat.categoria}</strong></td>
                                <td className="center">{cat.total_items}</td>
                                <td className="center">{cat.stock_disponible}</td>
                                <td className="center">{cat.en_circulacion}</td>
                                <td className="center">{cat.no_disponibles}</td>
                                <td className="center">{parseFloat(cat.porcentaje_ocupacion).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {inventario.length === 0 && <p className="no-data">No hay datos de inventario</p>}
            </div>

        </div>
    );
}