import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";

import { apiGetProject, apiUpdateProject, apiDeleteProject, apiListProjectMembers, apiAddMember, apiRemoveMember } from "@/modules/projects/api.vercel";
import type { Project, ProjectStatus } from "@/modules/projects/types";
import type { Member } from "@/modules/members/types";
//import { searchEligibleUsers, type EligibleUser } from "@/modules/projects/api.users";
import { apiListMembers } from "@/modules/members/api.vercel";
import { formatDate } from "@/lib/dates";

export function ProjectFormEdit() {
    const nav = useNavigate();
    const params = useParams();
    const id: string | undefined = params.id;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    // Stato per eliminazione
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteErr, setDeleteErr] = useState<string | null>(null);

    // Membri
    const [members, setMembers] = useState<Member[]>([]);
    const [userQuery, setUserQuery] = useState<string>("");
    const [userOptions, setUserOptions] = useState<Member[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const [membersErr, setMembersErr] = useState<string | null>(null);

    const stateOptions = [
        { label: "planned", value: "planned" },
        { label: "active", value: "active" },
        { label: "paused", value: "paused" },
        { label: "completed", value: "completed" },
        { label: "cancelled", value: "cancelled" },
    ];

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!id) {
                setErr("ID mancante");
                setLoading(false);
                return;
            }
            try {
                const p = await apiGetProject(id);
                const mem = await apiListProjectMembers(id);
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
                const opts = await apiListMembers(userQuery.trim());
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
    if (!project) return <div className="text-red-600">{err || "Project not found"}</div>;

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!project) return;
        setPending(true);
        setErr(null);
        try {
            await apiUpdateProject(project.id, {
                title: project.title,
                description: project.description,
                start_date: project.start_date,
                end_date: project.end_date,
                progress: project.progress,
                status: project.status as ProjectStatus,
            });
            nav("/projects");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    async function handleAddMember(user: Member) {
        if (!project) return;
        try {
            await apiAddMember(project.id, user.id);
            setMembers((prev) => [user, ...prev]);
            //console.log(user, members);
            setUserQuery("");
            setUserOptions([]);
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore aggiunta membro";
            setMembersErr(message);
        }
    }

    // 🗑️ Eliminazione progetto (con conferma)
    async function handleDeleteProject() {
        if (!project) return;
        const confirmed = window.confirm(`Eliminare definitivamente il progetto "${project.title}"?`);
        if (!confirmed) return;

        setDeleting(true);
        setDeleteErr(null);
        try {
            await apiDeleteProject(project.id);
            nav("/projects");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore eliminazione progetto";
            setDeleteErr(message);
            setDeleting(false);
        }
    }

    async function handleRemoveMember(userId: string) {
        if (!project) return;
        try {
            await apiRemoveMember(project.id, userId);
            setMembers((prev) => prev.filter((m) => m.id !== userId));
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Error on removing employee";
            setMembersErr(message);
        }
    }

    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex items-start justify-between">
                <h1 className="text-2xl font-semibold">Update project</h1>

                {/* Pulsante Elimina (danger) */}
                <div className="flex flex-col items-end gap-2">
                    {deleteErr && <p className="text-red-600 text-sm">{deleteErr}</p>}
                    <Button
                        type="button"
                        variant="danger-outline"
                        onClick={handleDeleteProject}
                        disabled={deleting}>
                        {deleting ? "Deleting" : "Delete project"}
                    </Button>
                </div>
            </div>

            {/* --- FORM PROGETTO --- */}
            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div>
                    <InputField
                        label="Title"
                        value={project.title}
                        onChange={(e) => setProject({ ...project, title: e.target.value })}
                    />
                </div>
                <div>
                    <TextAreaField
                        label="Description"
                        rows={4}
                        value={project.description ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProject({ ...project, description: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputField
                            type="date"
                            label="Date start"
                            value={project.start_date ? formatDate(project.start_date, { pattern: "yyyy-MM-dd" }) : ""}
                            onChange={(e) => setProject({ ...project, start_date: e.target.value || null })}
                        />
                    </div>
                    <div>
                        <InputField
                            type="date"
                            label="Date end"
                            value={project.end_date ? formatDate(project.end_date, { pattern: "yyyy-MM-dd" }) : ""}
                            onChange={(e) => setProject({ ...project, end_date: e.target.value || null })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <SelectField
                            label="State"
                            options={stateOptions}
                            value={project.status}
                            onChange={(e) => setProject({ ...project, status: e.target.value as Project["status"] })}
                        />
                    </div>
                    <div>
                        <InputField
                            type="number"
                            min={0}
                            max={100}
                            label="Progress"
                            value={project.progress}
                            onChange={(e) => setProject({ ...project, progress: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={() => nav(-1)}
                        variant="outline">
                        Cancel
                    </Button>
                    <Button
                        disabled={pending}
                        variant="primary">
                        {pending ? "Saving" : "Save"}
                    </Button>
                </div>
            </form>

            {/* --- MEMBRI --- */}
            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Members</h2>
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
                                            <div className="font-medium">{`${u.name} ${u.surname}`}</div>
                                            <div className="text-slate-500">#{u.id}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddMember(u)}
                                            className="rounded px-2 py-1 ring-1 text-sm">
                                            Add
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : userQuery.trim().length > 0 ? (
                            <div className="text-sm text-slate-500 px-2 py-2">No user found</div>
                        ) : (
                            <div className="text-sm text-slate-500 px-2 py-2">Type to search…</div>
                        )}
                    </div>
                </div>

                {membersErr && <p className="text-red-600 text-sm">{membersErr}</p>}

                {/* elenco membri */}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="py-2 pl-1">User</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => {
                            return (
                                <tr
                                    key={m.id}
                                    className="border-b">
                                    <td className="py-2 pl-1 font-medium">{`${m.name} ${m.surname}`}</td>
                                    <td className="text-right">
                                        <Button
                                            variant="link"
                                            onClick={() => handleRemoveMember(m.id)}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {members.length === 0 && (
                            <tr>
                                <td
                                    className="py-4 text-slate-500"
                                    colSpan={4}>
                                    No users on this project
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
