import Link from 'next/link';
import pool from '@/lib/db';
import { z } from 'zod';


interface SocioActivo {
    id: number;
    nombre: string;
    tipo_membresia: string;
    total_prestamos: string;
    devoluciones_tardias: string;
    tasa_morosidad_porcentaje: string;
}

const membersParams = z.object({
    q: z.string().default(''),
    page: z.coerce.number().min(1).default(1),
});

export default async function MembersReportPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const { q: query, page } = membersParams.parse(await searchParams);
    const limit = 5;
    const offset = (page - 1) * limit;

    let socios: SocioActivo[] = [];
    let totalRows = 0;

    try {
        const client = await pool.connect();
        // Consulta de la vista "vw_actividad_socios"
        const sqlData = `
      SELECT * FROM vw_actividad_socios 
      WHERE nombre ILIKE $1 OR tipo_membresia ILIKE $1
      ORDER BY tasa_morosidad_porcentaje DESC, total_prestamos DESC
      LIMIT $2 OFFSET $3
    `;

        // Conteo Total
        const sqlCount = `
      SELECT COUNT(*) as total FROM vw_actividad_socios 
      WHERE nombre ILIKE $1 OR tipo_membresia ILIKE $1
    `;

        const [resData, resCount] = await Promise.all([
            client.query(sqlData, [`%${query}%`, limit, offset]),
            client.query(sqlCount, [`%${query}%`])
        ]);

        socios = resData.rows;
        totalRows = Number(resCount.rows[0].total);

        client.release();
    } catch (error) {
        console.error('Error fetching members data:', error);
    }

    const totalPages = Math.ceil(totalRows / limit);

    const getBadgeColor = (tipo: string) => {
        switch (tipo) {
            case 'VIP': return 'bg-purple-900/40 text-purple-200 border-purple-500/50';
            case 'Profesor': return 'bg-blue-900/40 text-blue-200 border-blue-500/50';
            case 'Estudiante': return 'bg-green-900/40 text-green-200 border-green-500/50';
            default: return 'bg-gray-800 text-gray-300 border-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <Link href="/" className="text-accent hover:text-foreground transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Volver al Dashboard
                    </Link>
                </div>

                <header className="mb-12 border-b border-accent/20 pb-6">
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-purple-400">Actividad de Socios</h1>
                    <p className="text-accent mt-2 text-sm uppercase tracking-wide opacity-80">Análisis de comportamiento y riesgo.</p>
                </header>

                <form className="mb-8 flex gap-2">
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="BUSCAR NOMBRE O TIPO..."
                        className="p-3 bg-card border border-accent/30 w-full max-w-md focus:border-purple-500 outline-none text-foreground placeholder-accent/40 text-sm uppercase tracking-wider"
                    />
                    <button type="submit" className="bg-purple-600/80 text-white px-6 py-3 hover:bg-purple-600 font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer border border-purple-500/50">
                        Filtrar
                    </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {socios.map((socio) => {
                        const tasa = parseFloat(socio.tasa_morosidad_porcentaje);
                        let riskColor = 'text-green-400';
                        let riskBg = 'bg-green-500';
                        if (tasa > 20) { riskColor = 'text-yellow-400'; riskBg = 'bg-yellow-500'; }
                        if (tasa > 50) { riskColor = 'text-red-400'; riskBg = 'bg-red-500'; }

                        return (
                            <div key={socio.id} className="bg-card border border-accent/20 p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 group">

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground uppercase tracking-tight group-hover:text-purple-400 transition-colors">{socio.nombre}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-bold mt-2 inline-block uppercase tracking-wider ${getBadgeColor(socio.tipo_membresia)}`}>
                                            {socio.tipo_membresia}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-3xl font-bold text-foreground">{socio.total_prestamos}</span>
                                        <span className="text-[10px] text-accent uppercase tracking-[0.2em]">Préstamos</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-accent/10">
                                    <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2">
                                        <span className="text-accent">Tasa de Morosidad</span>
                                        <span className={`font-bold ${riskColor}`}>{tasa}%</span>
                                    </div>
                                    <div className="w-full bg-background border border-accent/10 h-2 overflow-hidden">
                                        <div
                                            className={`h-full ${riskBg} transition-all duration-500`}
                                            style={{ width: `${tasa}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-accent mt-3 font-mono opacity-80 uppercase">
                                        <span className="text-foreground font-bold">{socio.devoluciones_tardias}</span> devoluciones tardías
                                    </p>
                                </div>

                            </div>
                        );
                    })}
                </div>

                {socios.length === 0 && (
                    <div className="p-12 text-center text-accent uppercase tracking-widest text-xs border border-accent/20 border-dashed bg-card">
                        No se encontraron socios.
                    </div>
                )}

                <div className="mt-8 flex justify-between items-center border-t border-accent/20 pt-6">
                    <span className="text-xs text-accent uppercase tracking-wider">
                        Página <span className="font-bold text-foreground">{page}</span> / <span className="font-bold text-foreground">{totalPages || 1}</span>
                    </span>
                    <div className="space-x-2">
                        {page > 1 && (
                            <Link
                                href={`/reports/members?page=${page - 1}&q=${query}`}
                                className="px-4 py-2 border border-accent/30 hover:bg-accent/10 text-xs uppercase tracking-widest font-bold text-foreground transition-colors"
                            >
                                Anterior
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/reports/members?page=${page + 1}&q=${query}`}
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