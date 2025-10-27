import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
//import type { ProjectOutletContext } from "@/routes/projects/ProjectLayout";
import type { ProjectOutletContext } from "./ProjectContext";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiListTasks, apiCreateTask, apiUpdateTask, apiDeleteTask } from "@/modules/tasks/api.vercel";
import type { Task, CreateTaskInput } from "@/modules/tasks/types";
import { TaskFormModal } from "@/modules/tasks/TaskFormModal";
import { StatusBadge, PriorityBadge } from "@/modules/tasks/TaskBadges.tsx";

const statusOptions = [
    { label: "All", value: "" },
    { label: "Todo", value: "todo" },
    { label: "In progress", value: "in_progress" },
    { label: "Blocked", value: "blocked" },
    { label: "Done", value: "done" },
];

export default function ProjectTasksList() {
    const { project, loading: projectLoading, error } = useOutletContext<ProjectOutletContext>();

    const [items, setItems] = useState<Task[]>([]);
    const [q, setQ] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string | null>(null);

    // modal
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [editing, setEditing] = useState<Task | null>(null);

    const projectId = useMemo(() => (project ? Number(project.id) : undefined), [project]);

    async function load() {
        if (!projectId) return;
        setLoading(true);
        setErr(null);
        try {
            const data = await apiListTasks({
                project_id: projectId,
                q: q.trim() || undefined,
                status: (status || undefined) as Task["status"] | undefined,
            });
            setItems(data);
        } catch (e) {
            const msg = (e as { message?: string })?.message ?? "Errore caricamento";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;
        const t = window.setTimeout(() => {
            if (!cancelled) void load();
        }, 250); // debounce
        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [projectId, q, status]);

    if (projectLoading) return <ListSkeleton />;
    if (error || !projectId) return <div className="text-red-600">{error ?? "Project not found"}</div>;

    // create
    const handleCreate = async (payload: CreateTaskInput | Partial<Task>) => {
        const input = payload as CreateTaskInput;
        const created = await apiCreateTask(input);
        // ottimistico
        setItems((prev) => [created, ...prev]);
    };

    // update
    const handleUpdate = async (payload: CreateTaskInput | Partial<Task>) => {
        if (!editing) return;
        const updated = await apiUpdateTask(editing.id, payload);
        setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    };

    // delete
    const handleDelete = async (id: number) => {
        const ok = window.confirm("Delete this task?");
        if (!ok) return;
        await apiDeleteTask(id);
        setItems((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-3">
                <div className="flex-1">
                    <InputField
                        label="Search"
                        placeholder="Search title/description…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <SelectField
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={statusOptions}
                    />
                </div>
                <div className="ml-auto">
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditing(null);
                            setOpenModal(true);
                        }}>
                        New task
                    </Button>
                </div>
            </div>

            {loading && <ListSkeleton />}
            {err && <div className="text-red-600 text-sm">{err}</div>}

            {!loading && !err && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-2">Title</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Priority</th>
                                <th className="py-2">Due</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-b">
                                    <td className="py-2">{t.title}</td>
                                    <td className="uppercase">
                                        <StatusBadge value={t.status} />
                                    </td>
                                    <td className="capitalize">
                                        <PriorityBadge value={t.priority} />
                                    </td>
                                    <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</td>
                                    <td className="text-right space-x-2">
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                setEditing(t);
                                                setOpenModal(true);
                                            }}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => void handleDelete(t.id)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-6 text-center text-slate-500">
                                        No tasks found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal create/edit */}
            <TaskFormModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                projectId={projectId}
                initial={editing}
                onSubmit={editing ? handleUpdate : handleCreate}
            />
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
            </div>
        </div>
    );
}
