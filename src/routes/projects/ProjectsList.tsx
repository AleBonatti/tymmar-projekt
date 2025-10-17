import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiListProjects } from "@/modules/projects/api.vercel";
import type { Project } from "@/modules/projects/types";

export function ProjectsList() {
    const [items, setItems] = useState<Project[]>([]);
    const [q, setQ] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const t = window.setTimeout(async () => {
            setLoading(true);
            setErr(null);
            try {
                // Tipizza il risultato come Project[]
                const data = await apiListProjects(q);
                if (!cancelled) setItems(data);
            } catch (e) {
                const message = (e as { message?: string })?.message ?? "Errore caricamento";
                if (!cancelled) setErr(message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 250); // piccolo debounce sulla ricerca

        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [q]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Progetti</h1>
                <Link
                    to="/projects/new"
                    className="ml-auto rounded px-3 py-2 ring-1">
                    Nuovo progetto
                </Link>
            </div>

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cerca per titolo…"
                className="px-3 py-2 ring-1 rounded bg-white"
            />

            {loading && <div>Loading…</div>}
            {err && <div className="text-red-600 text-sm">{err}</div>}

            {!loading && !err && (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="py-2">Titolo</th>
                            <th>Periodo</th>
                            <th>Stato</th>
                            <th>Progresso</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b">
                                <td className="py-2">{p.title}</td>
                                <td>
                                    {p.start_date ?? "—"} → {p.end_date ?? "—"}
                                </td>
                                <td className="uppercase">{p.status}</td>
                                <td>{p.progress}%</td>
                                <td className="text-right">
                                    <Link
                                        to={`/projects/${p.id}/edit`}
                                        className="underline">
                                        Modifica
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td
                                    className="py-4 text-slate-500"
                                    colSpan={5}>
                                    Nessun progetto
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
