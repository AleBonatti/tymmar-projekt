import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Autocomplete } from "@/components/ui/Autocomplete";

import { apiUpdateProject, apiDeleteProject, apiListProjectMembers, apiAddMember, apiRemoveMember } from "@/modules/projects/api.vercel";
import type { Project, ProjectStatus } from "@/modules/projects/types";
import type { Member } from "@/modules/members/types";
import { getFullname } from "@/modules/members/types";
import type { Customer } from "@/modules/customers/types";
import { apiListCustomers } from "@/modules/customers/api.vercel";
import { formatDate } from "@/lib/dates";
import type { ProjectOutletContext } from "@/routes/projects/ProjectContext";

type ProjectDraft = {
    customer_id: number | null;
    title: string;
    description: string | null;
    start_date: string | null; // form usa stringa "yyyy-MM-dd" o ""
    end_date: string | null;
    progress: number;
    status: Project["status"];
};

export function ProjectFormEdit() {
    const nav = useNavigate();

    // 🔸 prende project/stati dal layout
    const { project, loading, error, reload } = useOutletContext<ProjectOutletContext>();

    // 🔸 stato di bozza per il form
    const [draft, setDraft] = useState<ProjectDraft | null>(null);

    // customers per la select
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);

    // members del progetto
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState<boolean>(true);

    // pending/error vari
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    // delete
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteErr, setDeleteErr] = useState<string | null>(null);

    // members error
    const [membersErr, setMembersErr] = useState<string | null>(null);

    const stateOptions = [
        { label: "planned", value: "planned" },
        { label: "active", value: "active" },
        { label: "paused", value: "paused" },
        { label: "completed", value: "completed" },
        { label: "cancelled", value: "cancelled" },
    ];

    // 📥 inizializza il draft quando arriva/ cambia il project dal context
    useEffect(() => {
        if (!project) return;
        setDraft({
            customer_id: project.customer_id,
            title: project.title,
            description: project.description,
            start_date: project.start_date ? formatDate(project.start_date, { pattern: "yyyy-MM-dd" }) : null,
            end_date: project.end_date ? formatDate(project.end_date, { pattern: "yyyy-MM-dd" }) : null,
            progress: project.progress,
            status: project.status,
        });
    }, [project]);

    // 📥 carica customers (una volta)
    useEffect(() => {
        let cancelled = false;
        async function loadCustomers() {
            setLoadingCustomers(true);
            try {
                const list = await apiListCustomers();
                if (!cancelled) setCustomers(list);
            } catch (e) {
                console.log(e);
                // opzionale: mostrare errore in UI
            } finally {
                if (!cancelled) setLoadingCustomers(false);
            }
        }
        void loadCustomers();
        return () => {
            cancelled = true;
        };
    }, []);

    // 📥 carica members del progetto quando il project è disponibile
    useEffect(() => {
        let cancelled = false;
        async function loadMembers() {
            if (!project) return;
            setLoadingMembers(true);
            setMembersErr(null);
            try {
                const mem = await apiListProjectMembers(String(project.id));
                if (!cancelled) setMembers(mem);
            } catch (e) {
                const message = (e as { message?: string })?.message ?? "Errore caricamento membri";
                if (!cancelled) setMembersErr(message);
            } finally {
                if (!cancelled) setLoadingMembers(false);
            }
        }
        void loadMembers();
        return () => {
            cancelled = true;
        };
    }, [project]);

    // 🔎 ricerca per Autocomplete (ritorna Member[])
    async function searchMembers(q: string): Promise<Member[]> {
        try {
            const { apiListMembers } = await import("@/modules/members/api.vercel");
            const list = q.trim() ? await apiListMembers(q.trim()) : [];
            const selectedIds = new Set(members.map((m) => m.id));
            return list.filter((m) => !selectedIds.has(m.id));
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore ricerca utenti";
            setMembersErr(message);
            return [];
        }
    }

    async function handleAddMember(user: Member) {
        if (!project) return;
        try {
            await apiAddMember(project.id, user.id);
            setMembers((prev) => [user, ...prev]);
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore aggiunta membro";
            setMembersErr(message);
        }
    }

    async function handleRemoveMember(userId: string) {
        if (!project) return;
        try {
            await apiRemoveMember(project.id, userId);
            setMembers((prev) => prev.filter((m) => m.id !== userId));
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore rimozione membro";
            setMembersErr(message);
        }
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!project || !draft) return;
        setPending(true);
        setErr(null);
        try {
            await apiUpdateProject(project.id, {
                customer_id: draft.customer_id,
                title: draft.title,
                description: draft.description,
                start_date: draft.start_date,
                end_date: draft.end_date,
                progress: draft.progress,
                status: draft.status as ProjectStatus,
            });
            await reload(); // riallinea il context
            //nav("/projects"); // o resta sulla pagina se preferisci
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
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

    // ⛔ stati principali dal context
    if (loading || !draft) {
        return (
            <div className="max-w-3xl mx-auto">
                <ProjectFormSkeleton />
            </div>
        );
    }
    if (error || !project) {
        return <div className="text-red-600">{error ?? "Project not found"}</div>;
    }

    return (
        <div className="max-w-3xl space-y-8 mx-auto">
            <div className="flex items-start justify-between">
                <h1 className="text-lg font-semibold">Update project</h1>

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

            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputField
                            label="Title"
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <SelectField
                            label="Client"
                            options={customers.map((c) => ({ label: c.title, value: String(c.id) }))}
                            value={draft.customer_id == null ? "" : String(draft.customer_id)}
                            onChange={(e) =>
                                setDraft((prev) =>
                                    prev
                                        ? {
                                              ...prev,
                                              customer_id: e.target.value === "" ? null : Number(e.target.value),
                                          }
                                        : prev
                                )
                            }
                            placeholderOption={loadingCustomers ? "Loading customers…" : "Select customer"}
                        />
                    </div>
                </div>

                <div>
                    <TextAreaField
                        label="Description"
                        rows={4}
                        value={draft.description ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft({ ...draft, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputField
                            type="date"
                            label="Date start"
                            value={draft.start_date ?? ""}
                            onChange={(e) => setDraft({ ...draft, start_date: e.target.value || null })}
                        />
                    </div>
                    <div>
                        <InputField
                            type="date"
                            label="Date end"
                            value={draft.end_date ?? ""}
                            onChange={(e) => setDraft({ ...draft, end_date: e.target.value || null })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <SelectField
                            label="State"
                            options={stateOptions}
                            value={draft.status}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value as Project["status"] })}
                        />
                    </div>
                    <div>
                        <InputField
                            type="number"
                            min={0}
                            max={100}
                            label="Progress"
                            value={draft.progress}
                            onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
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

                <Autocomplete<Member>
                    label="Associate member"
                    placeholder="Search member..."
                    selected={members}
                    onAdd={handleAddMember}
                    onRemove={(id) => handleRemoveMember(id)}
                    search={searchMembers}
                    getId={(m) => m.id}
                    getLabel={(m) => getFullname(m)}
                    getDescription={(m) => m.email}
                />

                {loadingMembers && <div className="text-sm text-slate-500">Loading members…</div>}
                {membersErr && <p className="text-red-600 text-sm">{membersErr}</p>}
            </section>
        </div>
    );
}

function ProjectFormSkeleton() {
    return (
        <div className="max-w-xl space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
                <div className="ml-auto">
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
        </div>
    );
}
