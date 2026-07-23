import classNames from "classnames"
import { useEffect, useMemo, useState } from 'preact/hooks'
import AsyncSelect from 'react-select/async'
import { useGetEpisodes, useQuery, useSearchSeries } from './hooks'
import type { Episode, Serie } from './type'
import { formatNumber, imgSrc, optionLabel } from './utils'

export function App() {

  const { setQueryParam, getQueryParam } = useQuery();

  const tconst = getQueryParam("t");

  const [serieSelected, setSerieSelected] = useState<Serie | null>(null)

  const [search, gettingSeries] = useSearchSeries()
  const [episodes] = useGetEpisodes(serieSelected)

  useEffect(() => {
    if (!tconst) return;

    fetch(`/api/series/${tconst}`)
      .then(result => result.json())
      .then((data) => setSerieSelected(data.data))
  }, []);

  return (
    <main className="container mx-auto p-4">

      <AsyncSelect
        unstyled
        autoFocus
        loadOptions={search}
        isLoading={gettingSeries}
        getOptionValue={(item) => item.tconst}
        getOptionLabel={optionLabel}
        onChange={(value) => {
          setSerieSelected(value);
          setQueryParam("t", value?.tconst ?? "")
        }}
        placeholder="The Big Bang Theory"
        //
        classNames={{
          control: ({ isFocused }) =>
            classNames(
              "min-h-11 rounded-lg border bg-slate-900 px-2 text-slate-100 shadow-sm transition-all",
              {
                "border-sky-500 ring-2 ring-sky-500/30": isFocused,
                "border-slate-700": !isFocused,
              }
            ),

          menu: () =>
            classNames(
              "mt-2 rounded-lg border border-slate-700",
              "bg-slate-900/80 backdrop-blur-sm",
              "shadow-2xl overflow-hidden"
            ),

          menuList: () => "p-1",

          option: ({ isFocused, isSelected, isDisabled }) =>
            classNames(
              "!cursor-pointer rounded-md px-3 py-2 transition-colors font-medium",
              {
                "bg-sky-600 text-white": isSelected,
                "bg-slate-800/50 text-slate-100 !font-semibold": isFocused && !isSelected,
                "text-slate-200": !isFocused && !isSelected,
                "cursor-not-allowed opacity-50": isDisabled,
              }
            ),

          placeholder: () => "text-slate-400",

          singleValue: () => "text-slate-100",

          input: () => "text-slate-100",

          indicatorSeparator: () => "my-2 w-px bg-slate-700",

          dropdownIndicator: () => "p-2 text-slate-400 transition-colors hover:text-slate-200",

          clearIndicator: () => "p-2 text-slate-400 transition-colors hover:text-red-400",

          noOptionsMessage: () => "px-3 py-2 text-sm text-slate-400",

          loadingMessage: () => "px-3 py-2 text-sm text-slate-400",
        }}
      />

      {/* <pre className="mt-2">{JSON.stringify(serie, null, 2)}</pre> */}
      <div className="mt-4 flex flex-col gap-4">
        <section class="flex gap-4 dark:text-white">
          <img src={imgSrc(serieSelected?.tconst)} alt="no cover" className="h-64 rounded-xl border border-gray-600" />
          <section className="flex flex-col gap-3 w-full">
            <h2 className="text-4xl font-bold">{serieSelected?.primaryTitle}</h2>
            <div>
              <span>🌟</span> <span className="font-bold">{serieSelected?.averageRating}</span><span>/10</span> <span className="ml-2 italic">{formatNumber(serieSelected?.numVotes)}</span>
            </div>

            <ul className="flex gap-2">
              {serieSelected?.genres?.split(",").map(item => (
                <li>
                  <span class="bg-violet-400 px-3 rounded-full font-bold">{item.trim()}</span>
                </li>
              ))}
            </ul>

            <div>
              <a
                href={`https://www.imdb.com/title/${serieSelected?.tconst}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 hover:underline underline-offset-4 transition-colors"
              >
                IMDb
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 5a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 11-2 0V7.414l-7.293 7.293a1 1 0 01-1.414-1.414L11.586 6H6a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div class="flex-1"></div>

            {/* Leyenda Parametrizada */}
            <div className="p-4 flex justify-end gap-6 text-xs italic font-semibold uppercase">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-700 rounded-sm"></div> <span>Pobre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-sm"></div> <span>Regular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> <span>Bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-lime-500 rounded-sm"></div> <span>Muy Bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div> <span>Obra Maestra</span>
              </div>
            </div>

          </section>
        </section>
        <HeatmapSeries data={episodes} />
      </div>
    </main>
  )
}

interface HeatmapProps {
  data: Episode[];
  // Función opcional para personalizar los colores según el rating
  getColorClass?: (rating: number) => string;
}

const HeatmapSeries: React.FC<HeatmapProps> = ({ data, getColorClass }) => {
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
