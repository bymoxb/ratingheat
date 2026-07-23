import { useEffect, useState } from "preact/hooks";
import type { Serie } from "../type";
import { formatNumber } from "../utils";
import { Genres } from "./genres";
import { RatingLegend } from "./rating.legend";

type Props = {
    serie: Serie;
};

export function SerieDetail({ serie }: Props) {

    const [src, setSrc] = useState("/no-cover.webp");

    useEffect(() => setSrc(`https://live.metahub.space/poster/medium/${serie.tconst}/img`), [serie.tconst])

    return (
        <section className="flex flex-col md:flex-row gap-6 dark:text-white items-center md:items-start">

            <img
                src={src}
                onError={() => setSrc("/no-cover.webp")}
                alt={serie.primaryTitle}
                className="h-72 w-52 md:h-64 md:w-44 rounded-2xl border border-gray-600 object-cover shadow-xl"
            />

            <section className="flex flex-col gap-4 w-full text-center md:text-left">
                <div>
                    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                        {serie.primaryTitle}
                    </h2>

                    <div className="mt-2 flex items-center justify-center md:justify-start text-lg">
                        <span className="text-yellow-400">🌟</span>
                        <span className="font-bold ml-1">{serie.averageRating}</span>
                        <span className="text-gray-400 mx-1">/10</span>
                        <span className="ml-2 text-sm font-bold italic text-gray-300">
                            ({formatNumber(serie.numVotes)} votes)
                        </span>
                    </div>
                </div>

                <div className="flex justify-center md:justify-start">
                    <Genres value={serie.genres} />
                </div>

                <div>
                <a
                    href={`https://www.imdb.com/title/${serie.tconst}`}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="inline-block text-amber-500 hover:text-amber-400 font-bold transition-colors"
                >
                        Go to IMDb ↗️
                </a>
                </div>

                <div className="hidden md:block flex-1" />

                <RatingLegend />
            </section>
        </section>
    );
}