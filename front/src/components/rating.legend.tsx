import classNames from "classnames";

const ratings = [
    ["bg-red-700", "Poor"],
    ["bg-orange-400", "Fair"],
    ["bg-yellow-400", "Good"],
    ["bg-lime-500", "Very Good"],
    ["bg-emerald-700", "Masterpiece"],
];

export function RatingLegend() {
    return (
        <div className="p-4 flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-[10px] md:text-xs italic font-semibold uppercase opacity-80">
            {ratings.map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                    <div className={classNames("w-3 h-3 rounded-sm shrink-0", color)} />
                    <span className="whitespace-nowrap">{label}</span>
                </div>
            ))}
        </div>
    );
}