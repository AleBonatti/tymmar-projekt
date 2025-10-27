import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";

import { apiCreateProject } from "@/modules/projects/api.vercel";
import type { ProjectStatus } from "@/modules/projects/types";
import type { CreateProjectInput } from "@/modules/projects/types"; // { customer_id: number|null, title, ... }
import type { Customer } from "@/modules/customers/types";
import { apiListCustomers } from "@/modules/customers/api.vercel";

export function ProjectFormNew() {
    const nav = useNavigate();

    const stateOptions = [
        { label: "planned", value: "planned" },
        { label: "active", value: "active" },
        { label: "paused", value: "paused" },
        { label: "completed", value: "completed" },
        { label: "cancelled", value: "cancelled" },
    ];

    // ✅ form tipizzato come CreateProjectInput (niente id)
    const [form, setForm] = useState<CreateProjectInput>({
        customer_id: null,
        title: "",
        description: "",
        start_date: null,
        end_date: null,
        progress: 0,
        status: "planned",
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);

    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function loadCustomers() {
            setLoadingCustomers(true);
            try {
                const list = await apiListCustomers();
                if (!cancelled) setCustomers(list);
            } catch {
                // opzionale: mostra un toast/errore
            } finally {
                if (!cancelled) setLoadingCustomers(false);
            }
        }
        void loadCustomers();
        return () => {
            cancelled = true;
        };
    }, []);

    function onChange<K extends keyof CreateProjectInput>(key: K, value: CreateProjectInput[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setErr(null);
        try {
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
            <h1 className="text-2xl font-semibold">New project</h1>

            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputField
                            label="Title"
                            value={form.title}
                            onChange={(e) => onChange("title", e.target.value)}
                        />
                    </div>
                    <div>
                        <SelectField
                            label="Client"
                            options={customers.map((c) => ({ label: c.title, value: String(c.id) }))}
                            value={form.customer_id == null ? "" : String(form.customer_id)} // number|null → string
                            onChange={(e) => onChange("customer_id", e.target.value === "" ? null : Number(e.target.value))}
                            placeholderOption={loadingCustomers ? "Loading customers…" : "Select customer"}
                        />
                    </div>
                </div>

                <div>
                    <TextAreaField
                        label="Description"
                        rows={4}
                        value={form.description ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange("description", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputField
                            type="date"
                            label="Start date"
                            value={form.start_date ?? ""} // usa "yyyy-MM-dd" o ""
                            onChange={(e) => onChange("start_date", e.target.value || null)}
                        />
                    </div>
                    <div>
                        <InputField
                            type="date"
                            label="End date"
                            value={form.end_date ?? ""}
                            onChange={(e) => onChange("end_date", e.target.value || null)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <SelectField
                            label="State"
                            options={stateOptions}
                            value={form.status}
                            onChange={(e) => onChange("status", e.target.value as ProjectStatus)}
                        />
                    </div>
                    <div>
                        <InputField
                            type="number"
                            min={0}
                            max={100}
                            label="Progress"
                            value={form.progress}
                            onChange={(e) => onChange("progress", Number(e.target.value))}
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
        </div>
    );
}
