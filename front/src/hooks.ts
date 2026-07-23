import debounce from 'lodash.debounce';
import { useEffect, useState } from "preact/hooks";
import type { Episode, Serie } from "./type";

export function useSearchSeries(): [(v: string, callback: any) => void, boolean] {
    const [isLoading, setIsLoading] = useState(false)

    const search = async (value: string) => {
        if (value.length < 2) return [];
        if (isLoading) return [];

        const params = new URLSearchParams()

        params.set("title", value)

        setIsLoading(true);

        const raw = await fetch("/api/series?" + params.toString())

        if (!raw.ok) {
            return [];
        }

        const data = await raw.json();

        setIsLoading(false);

        return data.data;
    }

    const debouncedLoadOptions =
        debounce((inputValue: string, callback) => search(inputValue)
            .then((data) => {
                callback(data)
            })
            .catch((error) => {
                console.error(error);
                callback([])
            })
            , 400);


    return [debouncedLoadOptions, isLoading]
}

export function useGetEpisodes(serie: Serie | null): [Episode[], boolean] {
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!serie) return;

        setIsLoading(true)
        fetch(`/api/series/${serie.tconst}/episodes`)
            .then(result => result.json())
            .then((data) => setEpisodes(data.data))
            .finally(() => setIsLoading(false));
    }, [serie]);

    return [episodes, isLoading];
}

export function useQuery() {
    const setQueryParam = (key: string, value: string) => {
        const url = new URL(window.location.href);

        url.searchParams.set(key, value);

        window.history.replaceState({}, "", url);
    }

    const getQueryParam = (key: string) => {
        const url = new URL(window.location.href);

        return url.searchParams.get(key);
    }

    return { setQueryParam, getQueryParam }
}

export function useGetSerieById(tconst: string | null, setSerie: (value: Serie | null) => void) {
    useEffect(() => {

        if (!tconst) return;

        fetch(`/api/series/${tconst}`)
            .then(res => res.json())
            .then(({ data }) => {
                setSerie(data);
            });

    }, [tconst]);
}