import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { createProject } from "@/modules/projects/api";
import { apiCreateProject } from "@/modules/projects/api.vercel";
//import type { CreateProjectInput, ProjectStatus } from "@/modules/projects/types";
import type { ProjectStatus } from "@/modules/projects/types";

// Tipo del form allineato al DTO dell'API
type CreateProjectPayload = {
    title: string;
    description: string | null;
    start_date: string | null; // formato YYYY-MM-DD oppure null
    end_date: string | null; // formato YYYY-MM-DD oppure null
    progress: number; // 0..100
    status: ProjectStatus; // "planned" | "active" | "paused" | "done" | "cancelled"
};

export function ProjectFormNew() {
    const nav = useNavigate();

    /* const [form, setForm] = useState<CreateProjectInput>({
        title: "",
        description: "",
        start_date: null,
        end_date: null,
        progress: 0,
        status: "planned",
    }); */

    const [form, setForm] = useState<CreateProjectPayload>({
        title: "",
        description: "",
        start_date: null,
        end_date: null,
        progress: 0,
        status: "planned",
    });

    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    /* function onChange<K extends keyof CreateProjectInput>(key: K, value: CreateProjectInput[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    } */

    function onChange<K extends keyof CreateProjectPayload>(key: K, value: CreateProjectPayload[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        try {
            //await createProject(form);
            await apiCreateProject(form);
            nav("/projects");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">Nuovo progetto</h1>

            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div>
                    <label className="block text-sm font-medium">Titolo</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        value={form.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Descrizione</label>
                    <textarea
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        rows={4}
                        value={form.description ?? ""}
                        onChange={(e) => onChange("description", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Inizio</label>
                        <input
                            type="date"
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.start_date ?? ""}
                            onChange={(e) => onChange("start_date", e.target.value || null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Fine</label>
                        <input
                            type="date"
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.end_date ?? ""}
                            onChange={(e) => onChange("end_date", e.target.value || null)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Stato</label>
                        <select
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.status}
                            onChange={(e) => onChange("status", e.target.value as ProjectStatus)}>
                            <option value="planned">planned</option>
                            <option value="active">active</option>
                            <option value="paused">paused</option>
                            <option value="done">done</option>
                            <option value="cancelled">cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Progresso</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.progress ?? 0}
                            onChange={(e) => onChange("progress", Number(e.target.value))}
                        />
                    </div>
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}
                <div className="flex gap-2">
                    <button
                        disabled={pending}
                        className="rounded px-3 py-2 ring-1">
                        {pending ? "Salvo…" : "Salva"}
                    </button>
                    <button
                        type="button"
                        onClick={() => nav(-1)}
                        className="rounded px-3 py-2 ring-1">
                        Annulla
                    </button>
                </div>
            </form>
        </div>
    );
}
