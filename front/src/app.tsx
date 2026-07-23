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
    <main className="container mx-auto p-3 md:p-6 lg:p-8">

      <SeriesSelect
        loadOptions={search}
        loading={gettingSeries}
        value={serieSelected}
        onChange={handleSerieChange}
      />

      <div className="mt-6 flex flex-col gap-6">

        {serieSelected && (
          <SerieDetail serie={serieSelected} />
        )}

        <div className="overflow-x-auto pb-4"> 
          <Heatmap episodes={episodes} />
        </div>

      </div>

    </main>
  )
}
