import { useEffect, useState } from "preact/hooks";
import type { Episode, Serie } from "./type";

export function useSearchSeries(): [(v: string) => Promise<Serie[]>, boolean] {
    const [isLoading, setIsLoading] = useState(false)

    const search = async (value: string): Promise<Serie[]> => {
        if (value.length < 3) return [];
        if (isLoading) return [];

        const params = new URLSearchParams()

        params.set("title", value)

        setIsLoading(true);

        const raw = await fetch("/api/series/search?" + params.toString())

        if (!raw.ok) {
            return [];
        }

        const data = await raw.json();

        setIsLoading(false);

        return data;
    }

    return [search, isLoading]
}

export function useGetEpisodes(serie: Serie | null): [Episode[], boolean] {
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!serie) return;

        setIsLoading(true)
        fetch(`/api/series/${serie.tconst}/episodes`)
            .then(result => result.json())
            .then(setEpisodes)
            .finally(() => {
                setIsLoading(false);
            });
    }, [serie]);

    return [episodes, isLoading];
}