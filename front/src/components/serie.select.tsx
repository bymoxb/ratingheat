import classNames from "classnames";
import AsyncSelect, { type AsyncProps } from "react-select/async";
import type { Serie } from "../type";
import { optionLabel } from "../utils";

type Props = {
    loadOptions: AsyncProps<Serie, false, any>["loadOptions"];
    loading: boolean;
    value: Serie | null;
    onChange: (value: Serie | null) => void;
};

export const selectStyles = {
    control: ({ isFocused }: { isFocused: boolean }) =>
        classNames(
            "min-h-11 rounded-lg border bg-slate-900 px-2 text-slate-100 shadow-sm transition-all",
            {
                "border-sky-500 ring-2 ring-sky-500/30": isFocused,
                "border-slate-700": !isFocused,
            }
        ),

    menu: () =>
        classNames(
            "mt-2 rounded-lg border border-slate-700",
            "bg-slate-900/80 backdrop-blur-sm",
            "shadow-2xl overflow-hidden"
        ),

    menuList: () =>
        "p-1",

    option: ({
        isFocused,
        isSelected,
        isDisabled,
    }: {
        isFocused: boolean;
        isSelected: boolean;
        isDisabled: boolean;
    }) =>
        classNames(
            "!cursor-pointer rounded-md px-3 py-2 transition-colors font-medium",
            {
                "bg-sky-600 text-white": isSelected,

                "bg-slate-800/50 text-slate-100 !font-semibold":
                    isFocused && !isSelected,

                "text-slate-200":
                    !isFocused && !isSelected,

                "cursor-not-allowed opacity-50":
                    isDisabled,
            }
        ),

    placeholder: () =>
        "text-slate-400",

    singleValue: () =>
        "text-slate-100",

    input: () =>
        "text-slate-100",

    indicatorSeparator: () =>
        "my-2 w-px bg-slate-700",

    dropdownIndicator: () =>
        "p-2 text-slate-400 transition-colors hover:text-slate-200",

    clearIndicator: () =>
        "p-2 text-slate-400 transition-colors hover:text-red-400",

    noOptionsMessage: () =>
        "px-3 py-2 text-sm text-slate-400",

    loadingMessage: () =>
        "px-3 py-2 text-sm text-slate-400",
};

export function SeriesSelect({
    loadOptions,
    loading,
    value,
    onChange
}: Props) {

    return (
        <AsyncSelect
            unstyled
            autoFocus

            id="serie-name"
            name="serie-name"

            value={value}
            loadOptions={loadOptions}
            isLoading={loading}

            getOptionValue={(item) => item.tconst}
            getOptionLabel={optionLabel}

            onChange={onChange}

            placeholder="The Big Bang Theory"

            classNames={selectStyles}
        />
    );
}