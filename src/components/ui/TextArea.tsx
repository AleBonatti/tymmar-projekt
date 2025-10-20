// src/components/ui/TextField.tsx
import React from "react";
import clsx from "clsx";

type CommonProps = {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    className?: string;
};

type InputProps = CommonProps &
    React.InputHTMLAttributes<HTMLInputElement> & {
        as?: "input"; // default
    };

type TextareaProps = CommonProps &
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        as: "textarea";
    };

type TextFieldProps = InputProps | TextareaProps;

export const TextField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(function TextField(props, ref) {
    const base = "rounded-md bg-white text-[#3A726A] placeholder-[#3A726A]/50 " + "focus:outline-none focus:ring-2 focus:ring-[#3A726A]/40 focus:bg-white/95 " + "transition-colors";
    const size = "px-3 py-2 text-base";

    /* if (props.as === "textarea") {
        const { label, error, fullWidth = true, className, ...rest } = props as TextareaProps;
        return (
            <label className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
                {label && <span className="text-sm font-medium text-[#3A726A]/90">{label}</span>}
                <textarea
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    className={clsx(base, size, fullWidth ? "w-full" : "w-auto", className)}
                    {...rest}
                />
                {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
            </label>
        );
    }

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
    ); */
    const { label, error, fullWidth = true, className, ...rest } = props as InputProps;
    return (
        <label className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
            {label && <span className="text-sm font-medium text-[#3A726A]/90">{label}</span>}
            {props.as === "textarea" ? (
                <textarea
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    className={clsx(base, size, fullWidth ? "w-full" : "w-auto", className)}
                    {...rest}
                />
            ) : (
                <input
                    ref={ref as React.Ref<HTMLInputElement>}
                    className={clsx(base, size, fullWidth ? "w-full" : "w-auto", className)}
                    {...rest}
                />
            )}
            {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
        </label>
    );
});
