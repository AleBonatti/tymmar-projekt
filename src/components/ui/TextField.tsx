// src/components/ui/TextField.tsx
import React from "react";
import clsx from "clsx";

type InputProps = {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    className?: string;
};

export const TextField = React.forwardRef<HTMLInputElement, InputProps>(function TextField(props, ref) {
    const base = "rounded-md bg-white text-[#3A726A] placeholder-[#3A726A]/50 " + "focus:outline-none focus:ring-2 focus:ring-[#3A726A]/40 focus:bg-white/95 " + "transition-colors";
    const size = "px-3 py-2 text-base";
    // default: input
    const { label, error, fullWidth = true, className, ...rest } = props as InputProps;
    return (
        <label className={clsx("inline-flex flex-col gap-1", fullWidth && "w-full")}>
            {label && <span className="text-sm font-medium text-[#3A726A]/90">{label}</span>}
            <input
                ref={ref as React.Ref<HTMLInputElement>}
                className={clsx(base, size, fullWidth ? "w-full" : "w-auto", className)}
                {...rest}
            />
            {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
        </label>
    );
});
