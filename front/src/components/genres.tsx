export function Genres({ value }: { value?: string }) {

    if (!value) return null;

    return (
        <ul className="flex gap-2">

            {value.split(",").map(genre => (
                <li key={genre}>
                    <span className="bg-violet-400 px-3 rounded-full font-bold">
                        {genre.trim()}
                    </span>
                </li>
            ))}

        </ul>
    );
}