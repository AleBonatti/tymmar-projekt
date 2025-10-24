import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiListCustomers } from "@/modules/customers/api.vercel";
import type { Customer } from "@/modules/customers/types";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/dates";

export function CustomersList() {
    const [items, setItems] = useState<Customer[]>([]);
    const [q, setQ] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const t = window.setTimeout(async () => {
            setLoading(true);
            setErr(null);
            try {
                // Tipizza il risultato come Customer[]
                const data = await apiListCustomers(q);
                if (!cancelled) setItems(data);
            } catch (e) {
                const message = (e as { message?: string })?.message ?? "Errore caricamento";
                if (!cancelled) setErr(message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 250); // piccolo debounce sulla ricerca

        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, [q]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between gap-2">
                <h1 className="text-2xl font-semibold">Customers</h1>
                <Button
                    as="link"
                    to="/customers/new"
                    className="text-2xl font-semibold"
                    variant="primary">
                    New customer
                </Button>
            </div>
            <InputField
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                value={q}
                fullWidth={false}
                placeholder="Search customers…"
            />
            {loading ? (
                // 🦴 Skeleton Loader
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between border-b py-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/12" />
                            <Skeleton className="h-4 w-1/12" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {err && <div className="text-red-600 text-sm">{err}</div>}
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-app-accent">
                                <th className="py-2 pl-1">Customer</th>
                                <th className="py-2 pl-1">Created At</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-b border-app-accent">
                                    <td className="py-2 pl-1">{p.title}</td>
                                    <td className="py-2 pl-1">{formatDate(p.created_at)}</td>
                                    <td className="text-right pr-1">
                                        <Link
                                            to={`/customers/${p.id}/edit`}
                                            className="link-base">
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td
                                        className="py-4 text-slate-500"
                                        colSpan={5}>
                                        No customers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
