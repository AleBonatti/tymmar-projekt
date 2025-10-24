import React from "react";
import clsx from "clsx";

export interface SelectFieldOption {
    label: string;
    value: string;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectFieldOption[];
    fullWidth?: boolean;
    className?: string;
    placeholderOption?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField({ label, error, options, fullWidth = true, className, placeholderOption, ...props }, ref) {
    const base = "ring-1 ring-app-accent/30 rounded-md bg-white text-app-accent placeholder-app-accent/50 " + "focus:outline-none focus:ring-2 focus:ring-app-accent/40 focus:bg-white/95 " + "transition-colors appearance-none"; // appearance-none rimuove freccia di default su Safari
    const size = "px-3 py-2 text-base";

    return (
        <label className={clsx("flex flex-col gap-1", fullWidth ? "w-full" : "inline-flex")}>
            {label && <span className="text-sm font-medium text-app-accent/90">{label}</span>}
            <div className="relative">
                <select
                    ref={ref}
                    className={clsx(base, size, fullWidth ? "w-full" : "!w-fit", className)}
                    {...props}>
                    {placeholderOption && <option value="">{placeholderOption}</option>}

                    {options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* piccola icona freccia custom */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-app-accent/60">▼</span>
            </div>
            {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
        </label>
    );
});
