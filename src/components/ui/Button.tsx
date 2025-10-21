import React from "react";
import { Link, type LinkProps } from "react-router-dom";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
    children: React.ReactNode;
}

// 🔸 Variante “button”
type ButtonAsButton = BaseProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        as?: "button";
        to?: never;
    };

// 🔸 Variante “link”
type ButtonAsLink = BaseProps &
    LinkProps & {
        as: "link";
    };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
    const { variant = "primary", size = "md", fullWidth = false, className, children, ...rest } = props;

    const base = "inline-flex items-center justify-center font-medium rounded transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    const sizeClasses = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };
    const variantClasses = {
        primary: "bg-app-accent text-app-on-accent hover:bg-app-accent-600",
        secondary: "bg-app-bg text-app-ink hover:bg-app-bg/90 border border-app-accent",
        outline: "bg-transparent text-app-accent border border-app-accent hover:bg-app-accent/10",
    };

    const classes = clsx(base, sizeClasses[size], variantClasses[variant], fullWidth && "w-full", className);

    // 🔸 Se è un link React Router
    if (props.as === "link") {
        const linkProps = rest as LinkProps;
        return (
            <Link
                {...linkProps}
                className={classes}>
                {children}
            </Link>
        );
    }

    // 🔸 Se è un normale bottone
    const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <button
            {...buttonProps}
            className={classes}>
            {children}
        </button>
    );
}
