import React from "react";
import clsx from "clsx";

export type TextAreaFieldProps = {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField({ label, error, fullWidth = true, className, rows = 4, ...props }, ref) {
    const base = "ring-1 ring-app-accent/30 rounded-md bg-white text-app-accent placeholder-app-accent/50 " + "focus:outline-none focus:ring-2 focus:ring-[#3A726A]/40 focus:bg-white/95 " + "transition-colors";
    const size = "px-3 py-2 text-base leading-relaxed";

    return (
        <label className={clsx("flex flex-col gap-1", fullWidth ? "w-full" : "inline-flex")}>
            {label && <span className="text-sm font-medium text-app-accent/90">{label}</span>}
            <textarea
                ref={ref}
                rows={rows}
                className={clsx(base, size, fullWidth ? "w-full" : "!w-fit", className)}
                {...props}
            />
            {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
        </label>
    );
});
