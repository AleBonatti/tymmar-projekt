import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject, updateProject, deleteProject, listProjectMembers, addProjectMember, removeProjectMember } from "@/modules/projects/api";
import type { Project, UpdateProjectPatch, ProjectMember } from "@/modules/projects/types";
import { searchEligibleUsers, type EligibleUser } from "@/modules/projects/api.users";

export function ProjectFormEdit() {
    const nav = useNavigate();
    const params = useParams();
    const id: string | undefined = params.id;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    // Membri
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [userQuery, setUserQuery] = useState<string>("");
    const [userOptions, setUserOptions] = useState<EligibleUser[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const [membersErr, setMembersErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!id) {
                setErr("ID mancante");
                setLoading(false);
                return;
            }
            try {
                const p = await getProject(id);
                const mem = await listProjectMembers(id);
                if (!mounted) return;
                setProject(p);
                setMembers(mem);
            } catch (e) {
                const message = (e as { message?: string })?.message ?? "Errore caricamento";
                setErr(message);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            setSearching(true);
            setMembersErr(null);
            try {
                const opts = await searchEligibleUsers(userQuery.trim());
                if (!cancelled) setUserOptions(opts);
            } catch (e) {
                const message = (e as { message?: string })?.message ?? "Errore ricerca utenti";
                if (!cancelled) setMembersErr(message);
            } finally {
                if (!cancelled) setSearching(false);
            }
        }
        // debounce semplice
        const t = window.setTimeout(run, 250);
        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [userQuery]);

    if (loading) return <div>Loading…</div>;
    if (!project) return <div className="text-red-600">{err || "Progetto non trovato"}</div>;

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        try {
            const patch: UpdateProjectPatch = {
                title: project?.title,
                description: project?.description,
                start_date: project?.start_date,
                end_date: project?.end_date,
                progress: project?.progress,
                status: project?.status,
            };
            await updateProject(project.id, patch);
            nav("/projects");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    async function handleAddMember(userId: string) {
        if (!project) return;
        try {
            const m = await addProjectMember(project.id, userId);
            setMembers((prev) => [m, ...prev]);
            setUserQuery("");
            setUserOptions([]);
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore aggiunta membro";
            setMembersErr(message);
        }
    }

    async function handleRemoveMember(userId: string) {
        if (!project) return;
        try {
            await removeProjectMember(project.id, userId);
            setMembers((prev) => prev.filter((m) => m.user_id !== userId));
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore rimozione membro";
            setMembersErr(message);
        }
    }

    return (
        <div className="max-w-3xl space-y-8">
            <h1 className="text-2xl font-semibold">Modifica progetto</h1>

            {/* --- FORM PROGETTO --- */}
            <form
                onSubmit={onSubmit}
                className="space-y-3">
                {/* titolo */}
                <div>
                    <label className="block text-sm font-medium">Titolo</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        value={project.title}
                        onChange={(e) => setProject({ ...project, title: e.target.value })}
                        required
                    />
                </div>

                {/* descrizione */}
                <div>
                    <label className="block text-sm font-medium">Descrizione</label>
                    <textarea
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        rows={4}
                        value={project.description ?? ""}
                        onChange={(e) => setProject({ ...project, description: e.target.value })}
                    />
                </div>

                {/* date */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Inizio</label>
                        <input
                            type="date"
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={project.start_date ?? ""}
                            onChange={(e) => setProject({ ...project, start_date: e.target.value || null })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Fine</label>
                        <input
                            type="date"
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={project.end_date ?? ""}
                            onChange={(e) => setProject({ ...project, end_date: e.target.value || null })}
                        />
                    </div>
                </div>

                {/* stato + progresso */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Stato</label>
                        <select
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={project.status}
                            onChange={(e) => setProject({ ...project, status: e.target.value as Project["status"] })}>
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
                            value={project.progress}
                            onChange={(e) => setProject({ ...project, progress: Number(e.target.value) })}
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

            {/* --- MEMBRI --- */}
            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Membri</h2>
                </div>

                {/* ricerca e aggiunta */}
                <div className="flex gap-2">
                    <input
                        className="w-full px-3 py-2 ring-1 rounded bg-white"
                        placeholder="Cerca utente (email, username, nome)…"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                    />
                    <div className="min-w-[12rem]">
                        {searching ? (
                            <div className="text-sm text-slate-500 px-2 py-2">Ricerca…</div>
                        ) : userOptions.length > 0 ? (
                            <ul className="border rounded bg-white max-h-48 overflow-auto">
                                {userOptions.map((u) => (
                                    <li
                                        key={u.id}
                                        className="flex items-center justify-between px-3 py-2">
                                        <div className="text-sm">
                                            <div className="font-medium">{u.full_name ?? u.username ?? u.email ?? u.id}</div>
                                            <div className="text-slate-500">{u.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddMember(u.id)}
                                            className="rounded px-2 py-1 ring-1 text-sm">
                                            Aggiungi
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : userQuery.trim().length > 0 ? (
                            <div className="text-sm text-slate-500 px-2 py-2">Nessun utente trovato</div>
                        ) : (
                            <div className="text-sm text-slate-500 px-2 py-2">Digita per cercare…</div>
                        )}
                    </div>
                </div>

                {membersErr && <p className="text-red-600 text-sm">{membersErr}</p>}

                {/* elenco membri */}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="py-2">Utente</th>
                            <th>Email</th>
                            <th>Aggiunto il</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => {
                            const u = userOptions.find((x) => x.id === m.user_id);
                            return (
                                <tr
                                    key={m.user_id}
                                    className="border-b">
                                    <td className="py-2 font-medium">{u?.full_name ?? u?.username ?? u?.email ?? m.user_id}</td>
                                    <td>{u?.email ?? "—"}</td>
                                    <td>{new Date(m.added_at).toLocaleString()}</td>
                                    <td className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(m.user_id)}
                                            className="rounded px-2 py-1 ring-1">
                                            Rimuovi
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {members.length === 0 && (
                            <tr>
                                <td
                                    className="py-4 text-slate-500"
                                    colSpan={4}>
                                    Nessun membro associato
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
