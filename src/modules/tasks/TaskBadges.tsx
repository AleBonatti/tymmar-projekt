export function StatusBadge({ value }: { value: "todo" | "in_progress" | "blocked" | "done" }) {
    const map = {
        todo: "bg-slate-100 text-slate-700",
        in_progress: "bg-blue-100 text-blue-700",
        blocked: "bg-amber-100 text-amber-700",
        done: "bg-emerald-100 text-emerald-700",
    } as const;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[value]}`}>{value.replace("_", " ")}</span>;
}

export function PriorityBadge({ value }: { value: "low" | "medium" | "high" | "urgent" }) {
    const map = {
        low: "bg-slate-100 text-slate-700",
        medium: "bg-sky-100 text-sky-700",
        high: "bg-orange-100 text-orange-700",
        urgent: "bg-red-100 text-red-700",
    } as const;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[value]}`}>{value}</span>;
}
