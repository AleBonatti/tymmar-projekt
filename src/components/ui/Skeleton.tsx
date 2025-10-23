//import { cn } from "@/lib/cn"; // se hai la tua utility cn() per unire classi
import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
    return <div className={clsx("animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/50", className)} />;
}
