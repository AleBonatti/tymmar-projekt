import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateProject } from "@/modules/projects/api.vercel";
import type { Project } from "@/modules/projects/types";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";

export function ProjectFormNew() {
    const nav = useNavigate();

    const stateOptions = [
        { label: "planned", value: "planned" },
        { label: "active", value: "active" },
        { label: "paused", value: "paused" },
        { label: "completed", value: "completed" },
        { label: "cancelled", value: "cancelled" },
    ];

    const [project, setProject] = useState<Project>({
        id: "",
        customer_id: null,
        title: "",
        description: "",
        start_date: null,
        end_date: null,
        progress: 0,
        status: "planned",
    });
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        try {
            await apiCreateProject(project);
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
            <h1 className="text-2xl font-semibold">New project</h1>

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
                            label="Start date"
                            value={project.start_date ?? ""}
                            onChange={(e) => setProject({ ...project, start_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <InputField
                            type="date"
                            label="End date"
                            value={project.end_date ?? ""}
                            onChange={(e) => setProject({ ...project, end_date: e.target.value })}
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
                            value={project.progress ?? ""}
                            onChange={(e) => setProject({ ...project, progress: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        className="text-2xl font-semibold"
                        onClick={() => nav(-1)}
                        variant="outline">
                        Cancel
                    </Button>
                    <Button
                        disabled={pending}
                        variant="primary">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
