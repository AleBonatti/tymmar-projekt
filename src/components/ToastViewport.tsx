import { type ReactNode } from "react";

interface ToastViewportProps {
    children: ReactNode;
}

export function ToastViewport({ children }: ToastViewportProps) {
    return <div className="fixed top-3 right-3 flex flex-col gap-2 sm:top-3 sm:right-3 z-50">{children}</div>;
}
