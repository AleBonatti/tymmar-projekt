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
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField({ label, error, options, fullWidth = true, className, ...props }, ref) {
    const base = "rounded-md bg-white text-[#3A726A] placeholder-[#3A726A]/50 " + "focus:outline-none focus:ring-2 focus:ring-[#3A726A]/40 focus:bg-white/95 " + "transition-colors appearance-none"; // appearance-none rimuove freccia di default su Safari
    const size = "px-3 py-2 text-base";

    return (
        <label className={clsx("flex flex-col gap-1", fullWidth ? "w-full" : "inline-flex")}>
            {label && <span className="text-sm font-medium text-[#3A726A]/90">{label}</span>}
            <div className="relative">
                <select
                    ref={ref}
                    className={clsx(base, size, fullWidth ? "w-full" : "!w-fit", className)}
                    {...props}>
                    {options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* piccola icona freccia custom */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#3A726A]/60">▼</span>
            </div>
            {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
        </label>
    );
});
