import { useEffect, useState } from "react";

type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastProps {
    message: string;
    variant?: ToastVariant;
    durationMs?: number; // auto-dismiss
    onClose: () => void;
}

export function Toast({ message, variant = "info", durationMs = 3500, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Mostra il toast (trigger animazione)
        const showId = window.setTimeout(() => setVisible(true), 10);

        // Chiudi dopo X ms
        const closeId = durationMs > 0 ? window.setTimeout(onClose, durationMs) : undefined;

        return () => {
            window.clearTimeout(showId);
            if (closeId) window.clearTimeout(closeId);
        };
    }, [durationMs, onClose]);

    const colors: Record<ToastVariant, string> = {
        info: "bg-sky-50 border-sky-200 text-sky-800",
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        error: "bg-red-50 border-red-200 text-red-800",
    };

    return (
        <div
            role="status"
            aria-live="polite"
            className={[
                "pointer-events-auto w-72 rounded border py-3 px-4 shadow-md transition-all duration-300 ease-out",
                "motion-reduce:transition-none motion-reduce:transform-none",
                visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3", // slide-down
                colors[variant],
            ].join(" ")}>
            <div className="flex items-start gap-3">
                <span className="text-sm">{message}</span>
                <button
                    aria-label="Chiudi"
                    onClick={onClose}
                    className="ml-auto text-xs">
                    ✕
                </button>
            </div>
        </div>
    );
}
