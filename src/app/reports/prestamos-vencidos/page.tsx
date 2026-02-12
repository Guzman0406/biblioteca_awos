import Link from 'next/link';
import { obtenerPrestamosVencidos } from '@/lib/back/prestamos';

export default async function PaginaPrestamosVencidos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const { prestamos, total, deudaTotal } = await obtenerPrestamosVencidos(params.q, page);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="container">
      <div className="header">
        <Link href="/" className="back-link">← Volver al Dashboard</Link>
        <h1>Préstamos Vencidos</h1>
        <p>Cálculo de multas</p>
      </div>


      <div className="kpi-single">
        <h3>Deuda</h3>
        <p className="kpi-value">${deudaTotal.toFixed(2)}</p>
        <p className="kpi-subtitle">{total} préstamos vencidos</p>
      </div>


      <form className="search-form">
        <input
          type="text"
          name="q"
          placeholder="Buscar por socio o libro..."
          defaultValue={params.q || ''}
        />
        <button type="submit" className="btn">Buscar</button>
      </form>


      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Socio</th>
              <th>Libro</th>
              <th>Fecha Límite</th>
              <th>Días de Atraso</th>
              <th>Multa Sugerida</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map(p => (
              <tr key={p.prestamo_id}>
                <td>
                  <div><strong>{p.socio}</strong></div>
                  <div className="email">{p.email}</div>
                </td>
                <td>{p.libro}</td>
                <td>{new Date(p.fecha_limite).toLocaleDateString('es-MX')}</td>
                <td>
                  <span className={`badge ${p.dias_atraso > 10 ? 'red' : 'yellow'}`}>
                    {p.dias_atraso} días
                  </span>
                </td>
                <td className="money">${parseFloat(p.multa_sugerida).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {prestamos.length === 0 && <p className="no-data">No hay préstamos vencidos</p>}
      </div>


      {totalPages > 1 && (
        <div className="pagination">
          <span>Página {page} de {totalPages}</span>
          <div className="pagination-buttons">
            {page > 1 && (
              <Link href={`/reports/prestamos-vencidos?page=${page - 1}&q=${params.q || ''}`} className="btn-secondary">
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/reports/prestamos-vencidos?page=${page + 1}&q=${params.q || ''}`} className="btn-secondary">
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}