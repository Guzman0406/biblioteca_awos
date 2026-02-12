import Link from 'next/link';
import { obtenerSocios } from '@/lib/back/socios';

export default async function PaginaSocios({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const { socios, total } = await obtenerSocios(params.q, page);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="container">
      <div className="header">
        <Link href="/" className="back-link">← Volver al Dashboard</Link>
        <h1>Actividad de Socios</h1>
        <p>Análisis de comportamiento</p>
      </div>


      <form className="search-form">
        <input
          type="text"
          name="q"
          placeholder="Buscar por nombre o membresía..."
          defaultValue={params.q || ''}
        />
        <button type="submit" className="btn">Buscar</button>
      </form>


      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo de Membresía</th>
              <th>Total Préstamos</th>
              <th>Devoluciones Tardías</th>
              <th>Tasa de Morosidad</th>
            </tr>
          </thead>
          <tbody>
            {socios.map(socio => {
              const tasa = parseFloat(socio.tasa_morosidad_porcentaje);
              let riskClass = 'low';
              if (tasa > 20) riskClass = 'medium';
              if (tasa > 50) riskClass = 'high';

              return (
                <tr key={socio.id}>
                  <td><strong>{socio.nombre}</strong></td>
                  <td>
                    <span className={`badge ${socio.tipo_membresia.toLowerCase()}`}>
                      {socio.tipo_membresia}
                    </span>
                  </td>
                  <td className="center">{socio.total_prestamos}</td>
                  <td className="center">{socio.devoluciones_tardias}</td>
                  <td className="center">
                    <span className={`risk ${riskClass}`}>
                      {tasa.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {socios.length === 0 && <p className="no-data">No se encontraron socios</p>}
      </div>


      {totalPages > 1 && (
        <div className="pagination">
          <span>Página {page} de {totalPages}</span>
          <div className="pagination-buttons">
            {page > 1 && (
              <Link href={`/reports/socios?page=${page - 1}&q=${params.q || ''}`} className="btn-secondary">
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/reports/socios?page=${page + 1}&q=${params.q || ''}`} className="btn-secondary">
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}