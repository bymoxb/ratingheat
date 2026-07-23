const ratings = [
    ["bg-red-700", "Poor"],
    ["bg-orange-400", "Fair"],
    ["bg-yellow-400", "Good"],
    ["bg-lime-500", "Very Good"],
    ["bg-emerald-700", "Masterpiece"],
];

export function RatingLegend() {

    return (
        <div className="p-4 flex justify-end gap-6 text-xs italic font-semibold uppercase">

            {ratings.map(([color, label]) => (
                <div
                    key={label}
                    className="flex items-center gap-2"
                >
                    <div className={`w-3 h-3 rounded-sm ${color}`} />
                    <span>{label}</span>
                </div>
            ))}

        </div>
    );
}