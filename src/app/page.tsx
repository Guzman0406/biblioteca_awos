import { obtenerDatosDashboard } from '@/lib/back/dashboard';
import Link from 'next/link';

export default async function PaginaInicio() {
  const data = await obtenerDatosDashboard();

  return (
    <div className="container">
      <header className="header">
        <h1>Sistema de Biblioteca</h1>
        <p>Panel de Control</p>
      </header>

      <div className="stats-grid">

        <Link href="/reports/multas" className="card">
          <h3>Multas Pendientes</h3>
          <p className="stat-value">${data.totalFines.toFixed(2)}</p>
        </Link>


        <Link href="/reports/prestamos-vencidos" className="card">
          <h3>Préstamos Vencidos</h3>
          <p className="stat-value">{data.overdueLoans}</p>
        </Link>


        <Link href="/reports/libros-populares" className="card">
          <h3>Libro Más Popular</h3>
          <p className="stat-label">{data.topBook}</p>
          <p className="stat-small">{data.topBookLoans} préstamos</p>
        </Link>


        <Link href="/reports/socios" className="card">
          <h3>Total de Socios</h3>
          <p className="stat-value">{data.totalMembers}</p>
        </Link>


        <Link href="/reports/inventario" className="card">
          <h3>Salud del Inventario</h3>
          <p className="stat-value">{data.inventoryHealth.toFixed(1)}%</p>
        </Link>
      </div>

    </div>
  );
}
