import Link from 'next/link';
import pool from '@/lib/db';
import { z } from 'zod';

interface LibroPopular {
    id: number;
    titulo: string;
    autor: string;
    total_prestamos: string;
    ranking: string;
    popularidad: string;
}

const searchSchema = z.object({
    q: z.string().default(''),
    page: z.coerce.number().min(1).default(1),
});

export default async function PopularBooksPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const { q: query, page } = searchSchema.parse(await searchParams);

    const limit = 5;
    const offset = (page - 1) * limit;

    let libros: LibroPopular[] = [];
    let totalRows = 0;

    try {
        const client = await pool.connect();

        const sqlData = `
      SELECT * FROM vw_libros_mas_prestados 
      WHERE titulo ILIKE $1 OR autor ILIKE $1
      ORDER BY ranking ASC
      LIMIT $2 OFFSET $3
    `;

        const sqlCount = `
      SELECT COUNT(*) as total FROM vw_libros_mas_prestados 
      WHERE titulo ILIKE $1 OR autor ILIKE $1
    `;
        const [resData, resCount] = await Promise.all([
            client.query(sqlData, [`%${query}%`, limit, offset]),
            client.query(sqlCount, [`%${query}%`])
        ]);

        libros = resData.rows;
        totalRows = Number(resCount.rows[0].total);

        client.release();
    } catch (error) {
        console.error('Error cargando reporte:', error);
    }

    const totalPages = Math.ceil(totalRows / limit);

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <Link href="/" className="text-accent hover:text-foreground transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Volver al Dashboard
                    </Link>
                </div>

                <header className="mb-12 flex justify-between items-end border-b border-accent/20 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter">Ranking de Popularidad</h1>
                        <p className="text-accent mt-2 text-sm uppercase tracking-wide opacity-80">Libros más solicitados.</p>
                    </div>

                    {libros.length > 0 && page === 1 && (
                        <div className="hidden md:block bg-accent/10 px-4 py-2 border border-accent/30">
                            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] block">Top #1</span>
                            <div className="font-bold text-foreground text-lg">{libros[0].titulo}</div>
                        </div>
                    )}
                </header>

                <form className="mb-8 flex gap-2">
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="BUSCAR TÍTULO O AUTOR..."
                        className="p-3 bg-card border border-accent/30 w-full max-w-md focus:border-accent outline-none text-foreground placeholder-accent/40 text-sm uppercase tracking-wider"
                    />
                    <button type="submit" className="bg-accent text-white px-6 py-3 hover:bg-accent/80 font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer">
                        Buscar
                    </button>
                </form>

                <div className="bg-card border border-accent/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-accent/10">
                            <thead className="bg-accent/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Rank</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Título</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Autor</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Préstamos</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Estatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent/10">
                                {libros.map((libro) => (
                                    <tr key={libro.id} className="hover:bg-accent/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 bg-background border border-accent/30 text-accent font-bold text-xs group-hover:border-foreground group-hover:text-foreground transition-all">
                                                {libro.ranking}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground text-sm uppercase tracking-wide">{libro.titulo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-accent text-sm uppercase tracking-wide">{libro.autor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-block bg-accent/10 text-foreground px-2 py-1 text-xs font-mono font-bold border border-accent/20">
                                                {libro.total_prestamos}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-[10px] leading-5 font-bold uppercase tracking-[0.2em] border 
                        ${libro.popularidad === 'Popular' ? 'bg-foreground/10 text-foreground border-foreground/20' : 'bg-background text-accent border-accent/20'}`}>
                                                {libro.popularidad}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {libros.length === 0 && (
                        <div className="p-12 text-center text-accent uppercase tracking-widest text-xs">
                            No se encontraron libros.
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
                                href={`/reports/popular-books?page=${page - 1}&q=${query}`}
                                className="px-4 py-2 border border-accent/30 hover:bg-accent/10 text-xs uppercase tracking-widest font-bold text-foreground transition-colors"
                            >
                                Anterior
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/reports/popular-books?page=${page + 1}&q=${query}`}
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