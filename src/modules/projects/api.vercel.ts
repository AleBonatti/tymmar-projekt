import { supabase } from "../../modules/supabase/client";
import type { CreateProjectDTO, UpdateProjectDTO } from "../../../api/projects/schema";

async function getToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Non autenticato");
    return token;
}

export async function apiCreateProject(input: CreateProjectDTO): Promise<void> {
    const token = await getToken();
    const resp = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    console.log(resp);
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
}

export async function apiListProjects(q?: string): Promise<unknown[]> {
    const token = await getToken();
    const url = new URL("/api/projects/list", window.location.origin);
    if (q && q.trim().length > 0) url.searchParams.set("q", q.trim());
    const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
    const data = (await resp.json()) as { projects: unknown[] };
    return data.projects;
}

export async function apiUpdateProject(id: string, patch: UpdateProjectDTO): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
    });
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
}

export async function apiDeleteProject(id: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
}

export async function apiListMembers(projectId: string): Promise<unknown[]> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${projectId}/members/list`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
    const data = (await resp.json()) as { members: unknown[] };
    return data.members;
}

export async function apiAddMember(projectId: string, userId: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${projectId}/members/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId }),
    });
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
}

export async function apiRemoveMember(projectId: string, userId: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${projectId}/members/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId }),
    });
    if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error ?? "Errore server");
    }
}
