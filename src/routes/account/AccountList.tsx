import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//import { listProfiles } from "@/modules/profiles/api";
//import { useCurrentProfile } from "@/modules/auth/useCurrentProfile";
import { apiListAccounts } from "@/modules/accounts/api.vercel";
import type { Account } from "@/modules/accounts/api.vercel";

export function AccountList() {
    const [items, setItems] = useState<Account[]>([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    //const { isAdmin } = useCurrentProfile();

    useEffect(() => {
        let mounted = true;
        const t = window.setTimeout(async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await apiListAccounts(q || undefined);
                if (mounted) setItems(data);
            } catch (e) {
                const message = (e as { message?: string })?.message ?? "Errore caricamento";
                if (mounted) setErr(message);
            } finally {
                if (mounted) setLoading(false);
            }
        }, 250);
        return () => {
            mounted = false;
            window.clearTimeout(t);
        };
    }, [q]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Gestione Account</h1>
                <Link
                    to="/account/new"
                    className="ml-auto rounded px-3 py-2 ring-1">
                    Nuovo account
                </Link>
            </div>

            <div className="flex gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cerca per email…"
                    className="px-3 py-2 ring-1 rounded bg-white"
                />
            </div>

            {loading && <div>Loading…</div>}
            {err && <div className="text-red-600 text-sm">{err}</div>}

            {!loading && !err && (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="py-2">Email</th>
                            <th>Username</th>
                            <th>Nome completo</th>
                            <th>Ruolo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b">
                                <td className="py-2">{p.email}</td>
                                <td>{p.username}</td>
                                <td>{p.full_name}</td>
                                <td className="uppercase">{p.role}</td>
                                <td className="text-right">
                                    <Link
                                        to={`/account/${p.id}/edit`}
                                        className="underline">
                                        Modifica
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td
                                    className="py-4 text-slate-500"
                                    colSpan={5}>
                                    Nessun profilo
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
