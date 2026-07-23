export function Genres({ value }: { value?: string }) {
    if (!value) return null;

    return (
        <ul className="flex flex-wrap gap-2 justify-center md:justify-start">
            {value.split(",").map(genre => (
                <li key={genre}>
                    <span className="bg-violet-600/20 text-violet-400 border border-violet-500/30 px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                        {genre.trim()}
                    </span>
                </li>
            ))}
        </ul>
    );
}