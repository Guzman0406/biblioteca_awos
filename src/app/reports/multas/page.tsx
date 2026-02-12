import Link from 'next/link';
import { obtenerDatosMultas } from '@/lib/back/multas';

export default async function PaginaMultas({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const datos = await obtenerDatosMultas(params.start, params.end);


  let totalCobrado = 0;
  let totalDeuda = 0;

  datos.forEach(d => {
    totalCobrado += parseFloat(d.total_cobrado);
    totalDeuda += parseFloat(d.deuda_pendiente);
  });

  return (
    <div className="container">
      <div className="header">
        <Link href="/" className="back-link">← Volver al Dashboard</Link>
        <h1>Reporte de Multas</h1>
        <p>Resumen financiero de multas cobradas y pendientes</p>
      </div>


      <form className="filters">
        <div className="filter-group">
          <label>Desde:</label>
          <input
            type="month"
            name="start"
            defaultValue={params.start || ''}
          />
        </div>
        <div className="filter-group">
          <label>Hasta:</label>
          <input
            type="month"
            name="end"
            defaultValue={params.end || ''}
          />
        </div>
        <button type="submit" className="btn">Filtrar</button>
        {(params.start || params.end) && (
          <Link href="/reports/multas" className="btn-secondary">Limpiar</Link>
        )}
      </form>


      <div className="kpi-grid">
        <div className="kpi-card green">
          <h3>Total Cobrado</h3>
          <p className="kpi-value">${totalCobrado.toFixed(2)}</p>
        </div>
        <div className="kpi-card red">
          <h3>Deuda Pendiente</h3>
          <p className="kpi-value">${totalDeuda.toFixed(2)}</p>
        </div>
        <div className="kpi-card blue">
          <h3>Efectividad</h3>
          <p className="kpi-value">
            {totalCobrado + totalDeuda > 0
              ? ((totalCobrado / (totalCobrado + totalDeuda)) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>


      <div className="table-container">
        <h2>Desglose Mensual</h2>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Cantidad</th>
              <th>Cobrado</th>
              <th>Pendiente</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(row => (
              <tr key={row.mes}>
                <td><strong>{row.mes}</strong></td>
                <td>{row.cantidad_multas}</td>
                <td className="green">${parseFloat(row.total_cobrado).toFixed(2)}</td>
                <td className="red">${parseFloat(row.deuda_pendiente).toFixed(2)}</td>
                <td><strong>${parseFloat(row.total_multas).toFixed(2)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
        {datos.length === 0 && <p className="no-data">No hay datos disponibles</p>}
      </div>

    </div>
  );
}