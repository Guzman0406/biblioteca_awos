import Link from 'next/link';
import pool from '@/lib/db';
import { z } from 'zod';

interface ReporteFinanciero {
    mes: string;
    cantidad_multas: string;
    total_cobrado: string;
    deuda_pendiente: string;
    total_multas: string;
}

const finesSchema = z.object({
    start: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal(''), z.undefined()]).optional(),
    end: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal(''), z.undefined()]).optional(),
});

export default async function FinesReportPage({
    searchParams,
}: {
    searchParams: Promise<{ start?: string; end?: string }>;
}) {
    const { start, end } = finesSchema.parse(await searchParams);

    let datos: ReporteFinanciero[] = [];
    let kpiTotalCobrado = 0;
    let kpiTotalDeuda = 0;

    const defaultStart = start || '';
    const defaultEnd = end || '';

    try {
        const client = await pool.connect();

        let sql = '';
        let params: any[] = [];

        if (start && end) {
            sql = `
             SELECT * FROM vw_resumen_multas 
             WHERE mes >= $1 AND mes <= $2
             ORDER BY mes DESC
           `;
            params = [start, end];
        } else {
            sql = `
             SELECT * FROM vw_resumen_multas 
             ORDER BY mes DESC
             LIMIT 12
           `;
        }

        const res = await client.query(sql, params);
        datos = res.rows;
        client.release();

        datos.forEach(d => {
            kpiTotalCobrado += Number(d.total_cobrado);
            kpiTotalDeuda += Number(d.deuda_pendiente);
        });

    } catch (error) {
        console.error('Error fetching financial report:', error);
    }


    const formatMoney = (amount: string | number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(Number(amount));
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <Link href="/" className="text-accent hover:text-foreground transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Volver al Dashboard
                    </Link>
                </div>

                <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-accent/20 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-green-500">Resumen Financiero</h1>
                        <p className="text-accent mt-2 text-sm uppercase tracking-wider opacity-80">Balance mensual de ingresos.</p>
                    </div>

                    <form className="bg-card p-4 border border-accent/20 flex gap-4 items-end">
                        <div>
                            <label className="block text-[10px] font-bold text-accent uppercase mb-1 tracking-wider">Desde</label>
                            <input
                                type="month"
                                name="start"
                                defaultValue={defaultStart}
                                className="bg-background border border-accent/30 p-2 text-xs text-foreground focus:border-green-500 outline-none uppercase font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-accent uppercase mb-1 tracking-wider">Hasta</label>
                            <input
                                type="month"
                                name="end"
                                defaultValue={defaultEnd}
                                className="bg-background border border-accent/30 p-2 text-xs text-foreground focus:border-green-500 outline-none uppercase font-mono"
                            />
                        </div>
                        <button type="submit" className="bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600/40 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer">
                            Filtrar
                        </button>
                        {(start || end) && (
                            <Link href="/reports/fines" className="text-accent hover:text-white text-[10px] uppercase px-2 py-2 transition-colors">
                                Reset
                            </Link>
                        )}
                    </form>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-card p-6 border border-green-500/30 flex flex-col justify-between group h-32">
                        <h3 className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">Ingresos Cobrados</h3>
                        <div className="text-3xl font-bold text-foreground">{formatMoney(kpiTotalCobrado)}</div>
                    </div>

                    <div className="bg-card p-6 border border-red-500/30 flex flex-col justify-between group h-32">
                        <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em]">Deuda Pendiente</h3>
                        <div className="text-3xl font-bold text-foreground">{formatMoney(kpiTotalDeuda)}</div>
                    </div>

                    <div className="bg-card p-6 border border-blue-500/30 flex flex-col justify-between group h-32">
                        <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Efectividad</h3>
                        <div className="text-3xl font-bold text-foreground">
                            {kpiTotalCobrado + kpiTotalDeuda > 0
                                ? ((kpiTotalCobrado / (kpiTotalCobrado + kpiTotalDeuda)) * 100).toFixed(1)
                                : 0}%
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-accent/20 overflow-hidden shadow-none">
                    <div className="px-6 py-4 border-b border-accent/10 bg-accent/5">
                        <h2 className="font-bold text-accent text-xs uppercase tracking-[0.2em]">Desglose Mensual</h2>
                    </div>
                    <table className="min-w-full divide-y divide-accent/10">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em] w-24">Mes</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Distribución</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-accent uppercase tracking-[0.2em] w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/10 bg-transparent">
                            {datos.map((fila) => {
                                const total = Number(fila.total_multas);
                                const cobradoPct = (Number(fila.total_cobrado) / total) * 100;
                                const deudaPct = (Number(fila.deuda_pendiente) / total) * 100;

                                return (
                                    <tr key={fila.mes} className="hover:bg-accent/5 transition-colors text-sm">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                            {fila.mes}
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="w-full max-w-md h-2 bg-background border border-accent/20 flex">
                                                <div
                                                    className="bg-green-500/80 h-full"
                                                    style={{ width: `${cobradoPct}%` }}
                                                    title={`Cobrado: ${formatMoney(fila.total_cobrado)}`}
                                                ></div>
                                                <div
                                                    className="bg-red-500/80 h-full"
                                                    style={{ width: `${deudaPct}%` }}
                                                    title={`Pendiente: ${formatMoney(fila.deuda_pendiente)}`}
                                                ></div>
                                            </div>
                                            <div className="flex text-[10px] mt-2 space-x-4 text-accent uppercase tracking-wider">
                                                <span className="flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-green-500 mr-2"></span>
                                                    Cobrado: <span className="text-foreground ml-1">{formatMoney(fila.total_cobrado)}</span>
                                                </span>
                                                <span className="flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-red-500 mr-2"></span>
                                                    Deuda: <span className="text-foreground ml-1">{formatMoney(fila.deuda_pendiente)}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-foreground">
                                            {formatMoney(fila.total_multas)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {datos.length === 0 && (
                        <div className="p-12 text-center text-accent uppercase tracking-widest text-xs">
                            No hay registros.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}