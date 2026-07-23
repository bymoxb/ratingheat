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
        <section className="flex gap-4 dark:text-white">

            <img
                src={src}
                onError={() => setSrc("/no-cover.webp")}
                alt={serie.primaryTitle}
                className="h-64 w-44 rounded-xl border border-gray-600 object-cover"
            />

            {/* <img
                src={imgSrc(serie.tconst)}
                alt={serie.primaryTitle}
                className="h-64 rounded-xl border border-gray-600"
            /> */}


            <section className="flex flex-col gap-3 w-full">

                <h2 className="text-4xl font-bold">
                    {serie.primaryTitle}
                </h2>


                <div>
                    🌟
                    <span className="font-bold ml-1">
                        {serie.averageRating}
                    </span>
                    /10

                    <span className="ml-2 italic">
                        {formatNumber(serie.numVotes)}
                    </span>
                </div>


                <Genres value={serie.genres} />

                <a
                    href={`https://www.imdb.com/title/${serie.tconst}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:underline"
                >
                    IMDb ↗
                </a>


                <div className="flex-1" />

                <RatingLegend />

            </section>

        </section>
    );
}