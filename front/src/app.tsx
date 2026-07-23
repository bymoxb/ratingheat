import { useState } from 'preact/hooks'
import Heatmap from './components/heatmap'
import { SerieDetail } from './components/serie.detail'
import { SeriesSelect } from "./components/serie.select"
import { useGetEpisodes, useGetSerieById, useQuery, useSearchSeries } from './hooks'
import type { Serie } from './type'

const Q_ID = "id"

export function App() {

  const { setQueryParam, getQueryParam } = useQuery();

  const [serieSelected, setSerieSelected] = useState<Serie | null>(null)

  const [search, gettingSeries] = useSearchSeries()
  const [episodes] = useGetEpisodes(serieSelected)

  useGetSerieById(getQueryParam(Q_ID), setSerieSelected)

  const handleSerieChange = (serie: Serie | null) => {
    setSerieSelected(serie);
    setQueryParam(Q_ID, serie?.tconst ?? "");
  };

  return (
    <main className="container mx-auto p-4">

      <SeriesSelect
        loadOptions={search}
        loading={gettingSeries}
        value={serieSelected}
        onChange={handleSerieChange}
      />

      <div className="mt-4 flex flex-col gap-4">

        {serieSelected && (
          <SerieDetail serie={serieSelected} />
        )}

        <Heatmap episodes={episodes} />

      </div>

    </main>
  )
}
