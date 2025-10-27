import { useEffect, useMemo, useState } from "react";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import type { CreateTaskInput, Task, TaskStatus, TaskPriority } from "./types";

const statusOptions = [
    { label: "Todo", value: "todo" },
    { label: "In progress", value: "in_progress" },
    { label: "Blocked", value: "blocked" },
    { label: "Done", value: "done" },
];

const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
];

export type TaskFormModalProps = {
    open: boolean;
    onClose: () => void;
    projectId: number;
    initial?: Task | null; // se presente → edit, altrimenti create
    onSubmit: (payload: CreateTaskInput | Partial<Task>) => Promise<void>;
};

export function TaskFormModal({ open, onClose, projectId, initial, onSubmit }: TaskFormModalProps) {
    const isEdit = Boolean(initial);

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string | null>(null);
    const [status, setStatus] = useState<TaskStatus>("todo");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [due_date, setDueDate] = useState<string | null>(null); // yyyy-MM-dd o null
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTitle(initial.title);
            setDescription(initial.description ?? null);
            setStatus(initial.status);
            setPriority(initial.priority);
            setDueDate(initial.due_date ? initial.due_date.slice(0, 10) : null);
        } else {
            setTitle("");
            setDescription(null);
            setStatus("todo");
            setPriority("medium");
            setDueDate(null);
        }
        setErr(null);
        setPending(false);
    }, [open, initial]);

    const canSubmit = useMemo(() => title.trim().length > 0 && !pending, [title, pending]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!canSubmit) return;

        setPending(true);
        setErr(null);
        try {
            if (isEdit) {
                await onSubmit({
                    title: title.trim(),
                    description,
                    status,
                    priority,
                    due_date, // ISO-like yyyy-MM-dd (server convertirà a Date|null)
                });
            } else {
                await onSubmit({
                    project_id: projectId,
                    title: title.trim(),
                    description,
                    status,
                    priority,
                    due_date,
                    order_index: 0,
                });
            }
            onClose();
        } catch (e) {
            const msg = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(msg);
        } finally {
            setPending(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-md bg-white ring-1 ring-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{isEdit ? "Edit task" : "New task"}</h3>
                    <button
                        onClick={onClose}
                        className="text-sm underline">
                        Close
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3">
                    <InputField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <TextAreaField
                        label="Description"
                        rows={4}
                        value={description ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <SelectField
                            label="Status"
                            options={statusOptions}
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        />
                        <SelectField
                            label="Priority"
                            options={priorityOptions}
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        />
                    </div>
                    <InputField
                        type="date"
                        label="Due date"
                        value={due_date ?? ""}
                        onChange={(e) => setDueDate(e.target.value || null)}
                    />

                    {err && <p className="text-sm text-red-600">{err}</p>}

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!canSubmit}
                            variant="primary">
                            {pending ? "Saving" : isEdit ? "Save changes" : "Create task"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
