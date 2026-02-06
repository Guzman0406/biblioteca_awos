import Link from 'next/link';
import pool from '@/lib/db';

interface InventarioCategoria {
    categoria: string;
    total_items: string;
    stock_disponible: string;
    en_circulacion: string;
    no_disponibles: string;
    porcentaje_ocupacion: string;
}

export default async function InventoryReportPage() {
    let inventario: InventarioCategoria[] = [];
    let kpiTotalLibros = 0;
    let kpiTotalPrestados = 0;

    try {
        const client = await pool.connect();
        const sql = `
      SELECT * FROM vw_salud_inventario 
      ORDER BY porcentaje_ocupacion DESC
    `;

        const res = await client.query(sql);
        inventario = res.rows;
        client.release();

        inventario.forEach(cat => {
            kpiTotalLibros += Number(cat.total_items);
            kpiTotalPrestados += Number(cat.en_circulacion);
        });

    } catch (error) {
        console.error('Error fetching inventory data:', error);
    }

    const ocupacionGlobal = kpiTotalLibros > 0
        ? ((kpiTotalPrestados / kpiTotalLibros) * 100).toFixed(1)
        : '0';

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <Link href="/" className="text-accent hover:text-white transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Volver al Dashboard
                    </Link>
                </div>

                <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-accent/30 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter">Salud del Inventario</h1>
                        <p className="text-accent mt-2 text-sm uppercase tracking-wider opacity-80">Estado actual del acervo y rotación.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-card px-6 py-4 border border-accent/20">
                            <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block mb-1">Total Acervo</span>
                            <div className="text-2xl font-bold">{kpiTotalLibros} <span className="text-xs font-normal opacity-50">LIBROS</span></div>
                        </div>
                        <div className="bg-accent/10 px-6 py-4 border border-accent/40">
                            <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block mb-1">Ocupación</span>
                            <div className="text-2xl font-bold text-foreground">{ocupacionGlobal}%</div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {inventario.map((cat) => {
                        const total = Number(cat.total_items);
                        const pctPrestado = (Number(cat.en_circulacion) / total) * 100;
                        const pctDisponible = (Number(cat.stock_disponible) / total) * 100;
                        const pctNoDisponible = (Number(cat.no_disponibles) / total) * 100;

                        return (
                            <div key={cat.categoria} className="bg-card border border-accent/20 p-6 hover:border-accent/50 transition-all duration-300 group">
                                <div className="flex flex-col md:flex-row justify-between mb-6 items-start md:items-center">
                                    <div>
                                        <h3 className="text-xl font-bold uppercase tracking-tight">{cat.categoria}</h3>
                                        <span className="text-xs text-accent uppercase tracking-wider">{total} items registrados</span>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-foreground"></div>
                                            <span>Prestados: {cat.en_circulacion}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-accent"></div>
                                            <span>Disponibles: {cat.stock_disponible}</span>
                                        </div>
                                        {(Number(cat.no_disponibles) > 0) && (
                                            <div className="flex items-center gap-2 text-red-400">
                                                <div className="w-2 h-2 bg-red-400"></div>
                                                <span>No Disp: {cat.no_disponibles}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full h-4 bg-background border border-accent/10 flex relative">
                                    <div
                                        className="bg-foreground h-full transition-all duration-500"
                                        style={{ width: `${pctPrestado}%` }}
                                    >
                                    </div>

                                    <div
                                        className="bg-accent h-full transition-all duration-500"
                                        style={{ width: `${pctDisponible}%` }}
                                    >
                                    </div>

                                    <div
                                        className="bg-red-500/50 h-full transition-all duration-500"
                                        style={{ width: `${pctNoDisponible}%` }}
                                    >
                                    </div>
                                </div>

                                <div className="flex justify-between mt-2 text-[10px] text-accent opacity-60 font-mono">
                                    <span>0%</span>
                                    <span>COBERTURA</span>
                                    <span>100%</span>
                                </div>

                            </div>
                        );
                    })}

                    {inventario.length === 0 && (
                        <div className="p-12 text-center bg-card border border-accent/20 border-dashed">
                            <p className="text-accent uppercase tracking-widest text-xs">Sin datos disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}