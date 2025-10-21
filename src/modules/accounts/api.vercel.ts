import { supabase } from "@/modules/supabase/client";

export type Account = {
    id: string; // = auth.users.id
    user_id: string; // uguale a id
    email: string;
    full_name: string | null;
    username: string | null;
    role: "admin" | "user";
    created_at: string;
};

async function getToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Non autenticato");
    return token;
}

async function parseError(resp: Response): Promise<never> {
    const ct = resp.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
        const j = (await resp.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "Errore server");
    }
    const t = await resp.text().catch(() => "");
    throw new Error(t || "Errore server");
}

export async function apiListAccounts(q?: string): Promise<Account[]> {
    const token = await getToken();
    const url = new URL("/api/accounts/list", window.location.origin);
    if (q && q.trim()) url.searchParams.set("q", q.trim());
    const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { accounts: Account[] };
    return data.accounts ?? [];
}

export async function apiGetAccount(id: string): Promise<Account> {
    const token = await getToken();
    const resp = await fetch(`/api/accounts/${id}/get`, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { account: Account };
    return data.account;
}

export async function apiCreateAccount(input: { email: string; role: "admin" | "user"; full_name?: string | null; username?: string | null; send_invite?: boolean }): Promise<{ account: Account; recovery_link: string | null }> {
    const token = await getToken();
    const resp = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { account: Account; recovery_link: string | null };
    return data;
}

export async function apiUpdateAccount(id: string, patch: Partial<Pick<Account, "role" | "full_name" | "username">>): Promise<Account> {
    const token = await getToken();
    const resp = await fetch(`/api/accounts/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { account: Account };
    return data.account;
}

export async function apiDeleteAccount(id: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/accounts/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
}
