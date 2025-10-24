import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";

import { apiGetProject, apiUpdateProject, apiDeleteProject, apiListProjectMembers, apiAddMember, apiRemoveMember } from "@/modules/projects/api.vercel";
import type { Project, ProjectStatus } from "@/modules/projects/types";
import { type Member, getFullname } from "@/modules/members/types";
//import { searchEligibleUsers, type EligibleUser } from "@/modules/projects/api.users";
import { apiListMembers } from "@/modules/members/api.vercel";
import { formatDate } from "@/lib/dates";
import { Skeleton } from "@/components/ui/Skeleton";

import { Autocomplete } from "@/components/ui/Autocomplete";
import type { Customer } from "@/modules/customers/types";
import { apiListCustomers } from "@/modules/customers/api.vercel";

export function ProjectFormEdit() {
    const nav = useNavigate();
    const params = useParams();
    const id: string | undefined = params.id;

    const [project, setProject] = useState<Project | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    // Stato per eliminazione
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteErr, setDeleteErr] = useState<string | null>(null);

    // Membri
    const [members, setMembers] = useState<Member[]>([]);
    //const [userQuery, setUserQuery] = useState<string>("");
    //const [userOptions, setUserOptions] = useState<Member[]>([]);
    //const [searching, setSearching] = useState<boolean>(false);
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
                const customers = await apiListCustomers();
                if (!mounted) return;
                setProject(p);
                setCustomers(customers);
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

    //if (!project) return <div className="text-red-600">{err || "Project not found"}</div>;

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!project) return;
        setPending(true);
        setErr(null);
        try {
            await apiUpdateProject(project.id, {
                customer_id: project.customer_id,
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

    // 🗑️ Eliminazione progetto (con conferma)
    async function handleDeleteProject() {
        if (!project) return;
        const confirmed = window.confirm(`Eliminare definitivamente il progetto "${project.title}"?`);
        if (!confirmed) return;

        setDeleting(true);
        setDeleteErr(null);
        try {
            await apiDeleteProject(project.id);
            nav("/customers");
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

    // 🔎 Ricerca per Autocomplete (ritorna Member[])
    async function searchMembers(q: string): Promise<Member[]> {
        if (!q.trim()) return [];
        try {
            const list = await apiListMembers(q.trim());
            // escludi già selezionati
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

    return (
        <div className="max-w-3xl space-y-8 mx-auto">
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

            {loading || !project ? (
                <ProjectFormSkeleton />
            ) : (
                <>
                    <form
                        onSubmit={onSubmit}
                        className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputField
                                    label="Title"
                                    value={project.title}
                                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <SelectField
                                    label="Client"
                                    options={customers.map((c) => ({ label: c.title, value: c.id }))}
                                    value={project.customer_id === null ? "" : String(project.customer_id)}
                                    /* onChange={(e) => setProject({ ...project, customer_id: e.target.value })} */
                                    onChange={(e) =>
                                        setProject((prev) => {
                                            if (!prev) return prev; // prev è null → ritorno null
                                            const v = e.target.value === "" ? null : Number(e.target.value);
                                            // 🔴 importante: usa lo spread, NON ricostruire a mano l'oggetto
                                            return { ...prev, customer_id: v };
                                        })
                                    }
                                    placeholderOption="Select customer"
                                />
                            </div>
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

                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold">Members</h2>
                        </div>

                        {/* ricerca e aggiunta */}
                        <Autocomplete
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
                        {membersErr && <p className="text-red-600 text-sm">{membersErr}</p>}
                    </section>
                </>
            )}
        </div>
    );
}

function ProjectFormSkeleton() {
    return (
        <div className="max-w-xl space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" /> {/* Titolo pagina */}
                <Skeleton className="h-4 w-80" /> {/* sottotitolo opzionale */}
            </div>

            {/* Titolo */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Descrizione */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
            </div>

            {/* Date */}
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

            {/* Stato / Progresso */}
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

            {/* Bottoni */}
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
