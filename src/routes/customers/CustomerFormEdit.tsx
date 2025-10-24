import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { Button } from "@/components/ui/Button";

import { apiGetCustomer, apiUpdateCustomer, apiDeleteCustomer } from "@/modules/customers/api.vercel";
import type { Customer } from "@/modules/customers/types";
import { Skeleton } from "@/components/ui/Skeleton";

export function CustomerFormEdit() {
    const nav = useNavigate();
    const params = useParams();
    const id: string | undefined = params.id;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    // Stato per eliminazione
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteErr, setDeleteErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!id) {
                setErr("Missing ID");
                setLoading(false);
                return;
            }
            try {
                const p = await apiGetCustomer(id);
                if (!mounted) return;
                setCustomer(p);
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

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!customer) return;
        setPending(true);
        setErr(null);
        try {
            await apiUpdateCustomer(customer.id, {
                title: customer.title,
                description: customer.description,
            });
            nav("/customers");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    // 🗑️ Eliminazione progetto (con conferma)
    async function handleDeleteCustomer() {
        if (!customer) return;
        const confirmed = window.confirm(`Eliminare definitivamente il progetto "${customer.title}"?`);
        if (!confirmed) return;

        setDeleting(true);
        setDeleteErr(null);
        try {
            await apiDeleteCustomer(customer.id);
            nav("/customers");
        } catch (e) {
            const message = (e as { message?: string })?.message ?? "Errore eliminazione progetto";
            setDeleteErr(message);
            setDeleting(false);
        }
    }

    return (
        <div className="max-w-3xl space-y-8 mx-auto">
            <div className="flex items-start justify-between">
                <h1 className="text-2xl font-semibold">Update customer</h1>

                {/* Pulsante Elimina (danger) */}
                <div className="flex flex-col items-end gap-2">
                    {deleteErr && <p className="text-red-600 text-sm">{deleteErr}</p>}
                    <Button
                        type="button"
                        variant="danger-outline"
                        onClick={handleDeleteCustomer}
                        disabled={deleting}>
                        {deleting ? "Deleting" : "Delete customer"}
                    </Button>
                </div>
            </div>

            {loading || !customer ? (
                <ProjectFormSkeleton />
            ) : (
                <>
                    <form
                        onSubmit={onSubmit}
                        className="space-y-3">
                        <div>
                            <InputField
                                label="Title"
                                value={customer.title}
                                onChange={(e) => setCustomer({ ...customer, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <TextAreaField
                                label="Description"
                                rows={4}
                                value={customer.description ?? ""}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomer({ ...customer, description: e.target.value })}
                            />
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
