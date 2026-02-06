import pool from '@/lib/db';
import Link from 'next/link';
import { Space_Mono } from 'next/font/google';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const COLORS = {
  bg: '#101015',
  text: '#F1F0E1',
  accent: '#506385',
  cardBg: '#16161c',
};

async function getSummaryData() {
  const client = await pool.connect();
  try {
    const fines = await client.query('SELECT SUM(deuda_pendiente) as total FROM vw_resumen_multas');
    const overdue = await client.query('SELECT COUNT(*) as total FROM vw_prestamos_vencidos');
    const topBook = await client.query('SELECT titulo, total_prestamos FROM vw_libros_mas_prestados LIMIT 1');
    const health = await client.query('SELECT AVG(porcentaje_ocupacion) as score FROM vw_salud_inventario');
    const recentMember = await client.query('SELECT COUNT(*) as total FROM vw_actividad_socios');

    const score = parseFloat(health.rows[0]?.score || '0');
    const inventoryStatus = score > 80 ? 'CRÍTICO' : (score > 50 ? 'ADVERTENCIA' : 'ÓPTIMO');

    return {
      totalFines: parseFloat(fines.rows[0]?.total || '0'),
      overdueLoans: parseInt(overdue.rows[0]?.total || '0'),
      mostPopular: topBook.rows[0],
      inventoryStatus: inventoryStatus,
      inventoryScore: score,
      memberCount: parseInt(recentMember.rows[0]?.total || '0'),
    };
  } finally {
    client.release();
  }
}

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-1 bg-[#2a2a35] mt-4 overflow-hidden">
    <div
      className="h-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        backgroundColor: COLORS.text 
      }}
    />
  </div>
);

const ViewCard = ({ title, kpiLabel, kpiValue, link, children }: { title: string, kpiLabel: string, kpiValue: string | number | React.ReactNode, link: string, children?: React.ReactNode }) => (
  <Link href={link} className="group block relative p-6 bg-[#101015] border border-[#506385]/30 hover:border-[#506385] transition-all duration-300">
    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0L10 0L10 10" stroke="#F1F0E1" strokeWidth="1" />
      </svg>
    </div>

    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-xs uppercase tracking-[0.2em] mb-6 opacity-60" style={{ color: COLORS.text }}>{title}</h2>

        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest opacity-40" style={{ color: COLORS.text }}>{kpiLabel}</div>
          <div className="text-3xl font-bold tracking-tighter" style={{ color: COLORS.text }}>{kpiValue}</div>
        </div>
      </div>

      {children && (
        <div className="mt-8 pt-4 border-t border-[#506385]/20">
          {children}
        </div>
      )}
    </div>
  </Link>
);

export default async function Dashboard() {
  const data = await getSummaryData();

  return (
    <main className={`min-h-screen p-6 md:p-12 flex flex-col ${spaceMono.className}`} style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>

      <div className="max-w-7xl w-full mx-auto">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end border-b pb-6" style={{ borderColor: COLORS.accent }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] mb-2 opacity-60">Sistema de Gestión</div>
            <h1 className="text-5xl md:text-6xl uppercase tracking-tighter font-bold">
              Panel Principal
            </h1>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <div className="text-xs opacity-50 tracking-widest">ESTADO DEL SISTEMA</div>
            <div className="text-sm font-bold text-[#506385]">EN LÍNEA</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <ViewCard
            title="Inventario"
            kpiLabel="Índice de Salud"
            kpiValue={`${data.inventoryScore.toFixed(0)}%`}
            link="/reports/inventory"
          >
            <div className="flex justify-between text-xs mb-1 opacity-70">
              <span className="uppercase tracking-wider">Estado</span>
              <span>{data.inventoryStatus}</span>
            </div>
            <ProgressBar value={data.inventoryScore} />
          </ViewCard>

          <ViewCard
            title="Tendencias"
            kpiLabel="Más Solicitado"
            kpiValue={
              <span className="text-xl line-clamp-2 leading-tight normal-case">
                {data.mostPopular?.titulo || "N/A"}
              </span>
            }
            link="/reports/popular-books"
          >
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="uppercase tracking-wider opacity-60">Préstamos Totales</span>
              <span className="font-bold">{data.mostPopular?.total_prestamos || 0}</span>
            </div>
          </ViewCard>

          <ViewCard
            title="Control de Préstamos"
            kpiLabel="Incidencias Activas"
            kpiValue={data.overdueLoans}
            link="/reports/overdue"
          >
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1 h-3 ${i <= Math.min(data.overdueLoans, 5) ? 'bg-[#F1F0E1]' : 'bg-[#506385]/30'}`}></div>
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-wider opacity-60">
                {data.overdueLoans > 0 ? "ATENCIÓN REQUERIDA" : "NORMAL"}
              </span>
            </div>
          </ViewCard>

          <ViewCard
            title="Finanzas"
            kpiLabel="Cartera Pendiente"
            kpiValue={`$${data.totalFines.toFixed(2)}`}
            link="/reports/fines"
          >
            <div className="w-full bg-[#506385]/10 p-2 mt-1 flex items-center justify-between border border-[#506385]/20">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Estado</span>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: COLORS.accent }}>ACTIVO</span>
            </div>
          </ViewCard>

          <ViewCard
            title="Comunidad"
            kpiLabel="Total Socios"
            kpiValue={data.memberCount}
            link="/reports/members"
          >
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px bg-[#506385] flex-grow opacity-30"></div>
              <div className="text-[10px] uppercase tracking-wider opacity-50">Base de Datos</div>
            </div>
          </ViewCard>

        </div>
      </div>
    </main>
  );
}

