import { supabase } from "@/modules/supabase/client";
//import type { ProjectMember } from "@/modules/projects/types";
import type { Member } from "./types";

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

export async function apiListMembers(query: string): Promise<Member[]> {
    const token = await getToken();
    const resp = await fetch(`/api/members/list?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { members: Member[] };
    return data.members ?? [];
}
