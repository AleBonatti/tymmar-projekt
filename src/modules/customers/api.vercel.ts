import { supabase } from "../../modules/supabase/client";
import type { Customer } from "@/modules/customers/types";

async function getToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Non autenticato");
    return token;
}

function parseError(resp: Response): Promise<never> {
    return (async () => {
        const ct = resp.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
            const j = (await resp.json().catch(() => null)) as { error?: string } | null;
            throw new Error(j?.error ?? "Errore server");
        }
        const t = await resp.text().catch(() => "");
        throw new Error(t || "Errore server");
    })();
}

export async function apiListCustomers(q?: string): Promise<Customer[]> {
    const token = await getToken();
    const url = new URL("/api/customers/list", window.location.origin);
    if (q && q.trim().length > 0) url.searchParams.set("q", q.trim());
    const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { customers: Customer[] };
    return data.customers ?? [];
}

export async function apiGetCustomer(id: string): Promise<Customer> {
    const token = await getToken();
    const resp = await fetch(`/api/customers/${id}/get`, {
        // se non hai l'endpoint "get", puoi crearne uno o usare /list filtrando.
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { customer: Customer };
    return data.customer;
}

export async function apiCreateCustomer(input: { title: string; description: string | null }): Promise<Customer> {
    const token = await getToken();
    const resp = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { customer: Customer };
    return data.customer;
}

export async function apiUpdateCustomer(id: string, patch: Partial<Customer>): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/customers/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
    });
    if (!resp.ok) return parseError(resp);
}

export async function apiDeleteCustomer(id: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/customers/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
}
