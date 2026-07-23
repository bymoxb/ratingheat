import { useMemo } from "preact/hooks";
import type { Episode } from "../type";

interface HeatmapProps {
    episodes: Episode[];
    getColorClass?: (rating: number) => string;
}

const Heatmap: React.FC<HeatmapProps> = ({ episodes: data, getColorClass }) => {
    // 1. Procesamiento de dimensiones
    const { seasons, maxEpisodes, dataMap } = useMemo(() => {
        const seasonsSet = [...new Set(data.map((d) => d.seasonNumber))].sort((a, b) => a - b);
        const maxEp = Math.max(...data.map((d) => d.episodeNumber));

        // Mapa para acceso rápido: "S-E" -> data
        const map = new Map<string, Episode>();
        data.forEach((item) => {
            map.set(`${item.seasonNumber}-${item.episodeNumber}`, item);
        });

        return { seasons: seasonsSet, maxEpisodes: maxEp, dataMap: map };
    }, [data]);

    // 2. Lógica de colores por defecto (Parametrizable)
    const defaultColorLogic = (rating: number) => {
        if (rating >= 9.0) return 'bg-emerald-700 text-white';
        if (rating >= 8.5) return 'bg-emerald-500 text-white';
        if (rating >= 8.0) return 'bg-lime-500 text-black';
        if (rating >= 7.5) return 'bg-yellow-400 text-black';
        if (rating >= 7.0) return 'bg-orange-400 text-black';
        if (rating >= 6.0) return 'bg-orange-600 text-white';
        if (rating > 0) return 'bg-red-700 text-white';
        return 'bg-gray-100 text-transparent'; // Sin datos
    };

    const colorResolver = getColorClass || defaultColorLogic;

    // Generar array de episodios para las filas (1 al maxEpisodes)
    const episodeRows = Array.from({ length: maxEpisodes }, (_, i) => i + 1);

    return (
        <div className="w-full rounded-xl shadow-lg border border-gray-600">
            <div className="">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr>
                            {/* Esquina superior izquierda vacía o con etiqueta */}
                            <th className="p-2 border-b border-r border-gray-600 sticky left-0 text-xs font-bold text-white uppercase tracking-widest min-w-[20px]">
                                E \ S
                            </th>
                            {/* Cabeceras de Temporadas (Columnas) */}
                            {seasons.map((s) => (
                                <th
                                    key={s}
                                    className="p-2 border-b border-r border-gray-600  text-sm font-bold text-white min-w-[40px]"
                                >
                                    S{s}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {episodeRows.map((epNum) => (
                            <tr key={epNum} className="group">
                                {/* Etiqueta de Fila (Número de Episodio) */}
                                <td className="p-3 border-r border-b border-gray-600 sticky left-0 z-10 text-center font-bold text-white text-sm">
                                    {epNum}
                                </td>

                                {/* Celdas de Datos */}
                                {seasons.map((sNum) => {
                                    const episode = dataMap.get(`${sNum}-${epNum}`);
                                    const rating = episode?.averageRating || 0;

                                    return (
                                        <td
                                            key={`${sNum}-${epNum}`}
                                            className="p-1 border-b border-r border-gray-600 relative group/cell"
                                        >
                                            {episode ? (
                                                <div
                                                    className={`
                            w-full h-10 flex items-center justify-center rounded-md
                            transition-all duration-200 cursor-default font-bold text-md
                            ${colorResolver(rating)}
                            hover:scale-105 hover:z-10 hover:shadow-md
                          `}
                                                >
                                                    {rating.toFixed(1)}
                                                </div>
                                            ) : (
                                                <div className="w-full h-12 rounded-md" /> // Celda vacía si la temporada tiene menos capítulos
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Heatmap
