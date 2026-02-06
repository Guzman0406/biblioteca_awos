import Link from 'next/link';
import pool from '@/lib/db';
import { z } from 'zod';

interface PrestamoVencido {
    prestamo_id: number;
    socio: string;
    email: string;
    libro: string;
    fecha_limite: Date;
    dias_atraso: number;
    multa_sugerida: string;
}

const paramsSchema = z.object({
    q: z.string().default(''),
    page: z.coerce.number().min(1).default(1),
});

export default async function OverdueReportPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const { q: query, page } = paramsSchema.parse(await searchParams);
    const limit = 5;
    const offset = (page - 1) * limit;

    let prestamos: PrestamoVencido[] = [];
    let totalRows = 0;
    let totalDeuda = 0;

    try {
        const client = await pool.connect();

        const sqlData = `
      SELECT * FROM vw_prestamos_vencidos 
      WHERE socio ILIKE $1 OR libro ILIKE $1
      ORDER BY dias_atraso DESC
      LIMIT $2 OFFSET $3
    `;

        const sqlCount = `
      SELECT COUNT(*) as total, SUM(multa_sugerida) as deuda_total 
      FROM vw_prestamos_vencidos 
      WHERE socio ILIKE $1 OR libro ILIKE $1
    `;

        const [resData, resCount] = await Promise.all([
            client.query(sqlData, [`%${query}%`, limit, offset]),
            client.query(sqlCount, [`%${query}%`])
        ]);

        prestamos = resData.rows;
        totalRows = Number(resCount.rows[0].total);
        totalDeuda = Number(resCount.rows[0].deuda_total || 0);

        client.release();
    } catch (error) {
        console.error('Error fetching overdue data:', error);
    }

    const totalPages = Math.ceil(totalRows / limit);

    const formatMoney = (amount: string | number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(Number(amount));
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'numeric', day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <Link href="/" className="text-accent hover:text-foreground transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Volver al Dashboard
                    </Link>
                </div>

                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-accent/20 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-red-500">Préstamos Vencidos</h1>
                        <p className="text-accent mt-2 text-sm uppercase tracking-wide opacity-80">Monitoreo de morosidad y cálculo de multas.</p>
                    </div>

                    <div className="bg-red-900/10 px-6 py-4 border border-red-500/30">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] block mb-1">Deuda Potencial</span>
                        <span className="text-2xl font-bold text-foreground">{formatMoney(totalDeuda)}</span>
                    </div>
                </header>

                <form className="mb-8 flex gap-2">
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="BUSCAR SOCIO O LIBRO..."
                        className="p-3 bg-card border border-accent/30 w-full max-w-md focus:border-red-500 outline-none text-foreground placeholder-accent/40 text-sm uppercase tracking-wider transition-colors"
                    />
                    <button type="submit" className="bg-red-600/80 text-white px-6 py-3 hover:bg-red-600 font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer border border-red-500/50">
                        Filtrar
                    </button>
                </form>

                <div className="bg-card border border-accent/20 overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-accent/10">
                            <thead className="bg-accent/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Socio</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Libro Pendiente</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Vence</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Atraso</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Multa</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent/10">
                                {prestamos.map((p) => (
                                    <tr key={p.prestamo_id} className="hover:bg-accent/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-foreground text-sm uppercase tracking-wide">{p.socio}</div>
                                            <div className="text-[10px] text-accent uppercase tracking-wider">{p.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-accent text-sm uppercase">{p.libro}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-accent/80 font-mono">
                                            {formatDate(p.fecha_limite)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 font-bold text-xs font-mono border 
                        ${p.dias_atraso > 10 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                                                {p.dias_atraso} DÍAS
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-foreground">
                                            {formatMoney(p.multa_sugerida)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button className="text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-[0.2em] border border-red-400/30 px-3 py-1 hover:bg-red-400/10 transition-all">
                                                Notificar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {prestamos.length === 0 && (
                        <div className="p-12 text-center text-accent uppercase tracking-widest text-xs">
                            Sin préstamos vencidos.
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-between items-center border-t border-accent/20 pt-6">
                    <span className="text-xs text-accent uppercase tracking-wider">
                        Página <span className="font-bold text-foreground">{page}</span> / <span className="font-bold text-foreground">{totalPages || 1}</span>
                    </span>
                    <div className="space-x-2">
                        {page > 1 && (
                            <Link
                                href={`/reports/overdue?page=${page - 1}&q=${query}`}
                                className="px-4 py-2 border border-accent/30 hover:bg-accent/10 text-xs uppercase tracking-widest font-bold text-foreground transition-colors"
                            >
                                Anterior
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/reports/overdue?page=${page + 1}&q=${query}`}
                                className="px-4 py-2 border border-accent/30 hover:bg-accent/10 text-xs uppercase tracking-widest font-bold text-foreground transition-colors"
                            >
                                Siguiente
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}