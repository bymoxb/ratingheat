export default function WelcomeMessage() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-slate-700 rounded-2xl bg-slate-900/50">
            <p className="text-slate-300 font-medium text-lg">
                Search for a TV Show to get started
            </p>
            <p className="text-slate-400 text-md mt-1">
                Explore episode ratings and trends over seasons.
            </p>
            <div className="mt-8 flex gap-2">
                <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">Ej: The Big Bang Theory</span>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">Ej: Breaking Bad</span>
            </div>
        </div>
    );
}