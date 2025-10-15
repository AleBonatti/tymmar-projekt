// src/routes/account/AccountFormEdit.tsx
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfile, updateProfile, deleteProfile } from "@/modules/profiles/api";
import { useCurrentProfile, type Profile } from "@/modules/auth/useCurrentProfile";

type UIError = string | null;
type Role = "admin" | "user";

// I campi modificabili da UI (escludiamo chiavi di sistema)
type EditableProfileFields = {
    email: string | null;
    username: string | null;
    full_name: string | null;
    role?: Role; // modificabile solo se admin
};

type UpdatePatch = Partial<EditableProfileFields>;

export function AccountFormEdit() {
    const nav = useNavigate();
    const params = useParams(); // v6.27: generico facoltativo; usiamo safe access
    const id: string | undefined = params.id;

    const { isAdmin, profile: me } = useCurrentProfile();

    const [form, setForm] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pending, setPending] = useState<boolean>(false);
    const [err, setErr] = useState<UIError>(null);

    useEffect(() => {
        let mounted = true;

        async function run() {
            if (!id) {
                setErr("ID mancante");
                setLoading(false);
                return;
            }
            try {
                const p = await getProfile(id);
                if (mounted) setForm(p);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Errore caricamento";
                setErr(message);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        run();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) return <div>Loading…</div>;
    if (!form) return <div className="text-red-600">{err || "Profilo non trovato"}</div>;

    const canEditRole: boolean = isAdmin;
    const canDelete: boolean = isAdmin && me?.id !== form.id;

    function onFieldChange<K extends keyof EditableProfileFields>(key: K, value: EditableProfileFields[K]) {
        setForm((prev) => (prev ? ({ ...prev, [key]: value } as Profile) : prev));
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form) return;

        setPending(true);
        setErr(null);

        try {
            const patch: UpdatePatch = {
                email: form.email ?? null,
                username: form.username ?? null,
                full_name: form.full_name ?? null,
            };
            if (canEditRole) {
                patch.role = form.role; // assicurato dal tipo
            }
            await updateProfile(form.id, patch);
            nav("/account");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    async function onDelete() {
        if (!form) return;

        if (!canDelete) return;
        const confirmed = window.confirm("Eliminare questo profilo?");
        if (!confirmed) return;

        try {
            await deleteProfile(form.id);
            nav("/account");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Errore eliminazione";
            // uso alert per semplicità; puoi gestire con stato se preferisci
            alert(message);
        }
    }

    return (
        <div className="max-w-lg space-y-4">
            <h1 className="text-2xl font-semibold">Modifica profilo</h1>

            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div>
                    <label className="block text-sm font-medium">User ID</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-slate-100"
                        value={form.id}
                        disabled
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        value={form.email ?? ""}
                        onChange={(e) => onFieldChange("email", e.target.value || null)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.username ?? ""}
                            onChange={(e) => onFieldChange("username", e.target.value || null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nome completo</label>
                        <input
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.full_name ?? ""}
                            onChange={(e) => onFieldChange("full_name", e.target.value || null)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Ruolo</label>
                    <select
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        value={form.role}
                        onChange={(e) => onFieldChange("role", e.target.value as Role)}
                        disabled={!canEditRole}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                    {!canEditRole && <p className="text-xs text-slate-500 mt-1">Solo admin può cambiare ruolo.</p>}
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
                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="ml-auto rounded px-3 py-2 ring-1 text-red-600">
                            Elimina
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
