import type { Serie } from "./type";

export function formatNumber(num: number = 0) {
    if (num >= 1_000_000) {
        return (num / 1_000_000)
            .toFixed(num % 1_000_000 === 0 ? 0 : 1)
            .replace(/\.0$/, "") + "M";
    }

    if (num >= 1_000) {
        return (num / 1_000)
            .toFixed(num % 1_000 === 0 ? 0 : 1)
            .replace(/\.0$/, "") + "K";
    }

    return num.toString();
}

export function optionLabel(s: Serie) {
    if (!s) return "";

    let format = "%n (%sy - %ey)"

    format = format.replace("%n", s.primaryTitle);

    if (s.startYear) {
        format = format.replace("%sy", s.startYear + "");
    }

    if (s.endYear) {
        format = format.replace("%ey", s.endYear + "");
    }

    format = format.replace("%ey", "");

    return format;
}
