import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "@/modules/profiles/api";
import { useCurrentProfile } from "@/modules/auth/useCurrentProfile";

type Role = "admin" | "user";

type NewProfileInput = {
    id: string; // UUID dell’utente in auth.users
    email?: string;
    username?: string;
    full_name?: string;
    role?: Role; // default "user" se non passato
};

type UIError = string | null;

export function AccountFormNew() {
    const nav = useNavigate();
    const { isAdmin } = useCurrentProfile();

    const [form, setForm] = useState<Required<Pick<NewProfileInput, "id">> & Omit<NewProfileInput, "id">>({
        id: "",
        email: "",
        username: "",
        full_name: "",
        role: "user",
    });

    const [pending, setPending] = useState(false);
    const [err, setErr] = useState<UIError>(null);

    if (!isAdmin) return <div className="text-red-600">Solo admin.</div>;

    function onChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setErr(null);

        try {
            const payload: NewProfileInput = {
                id: form.id,
                email: form.email || undefined,
                username: form.username || undefined,
                full_name: form.full_name || undefined,
                role: form.role ?? "user",
            };
            await createProfile(payload);
            nav("/account");
        } catch (e) {
            const message = e instanceof Error ? e.message : "Errore salvataggio";
            setErr(message);
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="max-w-lg space-y-4">
            <h1 className="text-2xl font-semibold">Nuovo profilo</h1>

            <form
                onSubmit={onSubmit}
                className="space-y-3">
                <div>
                    <label className="block text-sm font-medium">User ID (UUID di auth.users)</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        value={form.id}
                        onChange={(e) => onChange("id", e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        type="email"
                        value={form.email}
                        onChange={(e) => onChange("email", e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.username}
                            onChange={(e) => onChange("username", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nome completo</label>
                        <input
                            className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                            value={form.full_name}
                            onChange={(e) => onChange("full_name", e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Ruolo</label>
                    <select
                        className="mt-1 w-full px-3 py-2 ring-1 rounded bg-white"
                        value={form.role}
                        onChange={(e) => onChange("role", e.target.value as Role)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
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
        </div>
    );
}
