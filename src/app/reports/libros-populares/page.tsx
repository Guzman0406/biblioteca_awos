import Link from 'next/link';
import { obtenerLibrosPopulares } from '@/lib/back/libros';

export default async function PaginaLibrosPopulares({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const { libros, total } = await obtenerLibrosPopulares(params.q, page);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="container">
      <div className="header">
        <Link href="/" className="back-link">← Volver al Dashboard</Link>
        <h1>Libros Más Populares</h1>
        <p>Ranking de libros más solicitados</p>
      </div>


      <form className="search-form">
        <input
          type="text"
          name="q"
          placeholder="Buscar por título o autor..."
          defaultValue={params.q || ''}
        />
        <button type="submit" className="btn">Buscar</button>
      </form>


      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Total Préstamos</th>
            </tr>
          </thead>
          <tbody>
            {libros.map(libro => (
              <tr key={libro.id}>
                <td className="ranking">#{libro.ranking}</td>
                <td><strong>{libro.titulo}</strong></td>
                <td>{libro.autor}</td>
                <td className="center">{libro.total_prestamos}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {libros.length === 0 && <p className="no-data">No se encontraron libros</p>}
      </div>


      {totalPages > 1 && (
        <div className="pagination">
          <span>Página {page} de {totalPages}</span>
          <div className="pagination-buttons">
            {page > 1 && (
              <Link href={`/reports/libros-populares?page=${page - 1}&q=${params.q || ''}`} className="btn-secondary">
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/reports/libros-populares?page=${page + 1}&q=${params.q || ''}`} className="btn-secondary">
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}