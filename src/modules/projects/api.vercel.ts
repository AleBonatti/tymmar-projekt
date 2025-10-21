import { supabase } from "../../modules/supabase/client";
//import type { CreateProjectDTO, UpdateProjectDTO } from "../../../api/projects/schema";
import type { Project, ProjectMember, ProjectStatus } from "@/modules/projects/types";

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

export async function apiListProjects(q?: string): Promise<Project[]> {
    const token = await getToken();
    const url = new URL("/api/projects/list", window.location.origin);
    if (q && q.trim().length > 0) url.searchParams.set("q", q.trim());
    const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { projects: Project[] };
    return data.projects ?? [];
}

export async function apiGetProject(id: string): Promise<Project> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${id}/get`, {
        // se non hai l'endpoint "get", puoi crearne uno o usare /list filtrando.
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { project: Project };
    return data.project;
}

export async function apiCreateProject(input: {
    title: string;
    description: string | null;
    start_date: string | null; // YYYY-MM-DD | null
    end_date: string | null; // YYYY-MM-DD | null
    progress: number; // 0..100
    status: ProjectStatus; // "planned" | "active" | "paused" | "done" | "cancelled"
}): Promise<Project> {
    const token = await getToken();
    const resp = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { project: Project };
    return data.project;
}

export async function apiUpdateProject(id: string, patch: Partial<Project>): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
    });
    if (!resp.ok) return parseError(resp);
}

export async function apiDeleteProject(id: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
}

export async function apiListProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${projectId}/members/list`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { members: ProjectMember[] };
    return data.members ?? [];
}

export async function apiAddMember(projectId: string, userId: string): Promise<ProjectMember> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${projectId}/members/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId }),
    });
    if (!resp.ok) return parseError(resp);
    const data = (await resp.json()) as { member: ProjectMember };
    return data.member;
}

export async function apiRemoveMember(projectId: string, userId: string): Promise<void> {
    const token = await getToken();
    const resp = await fetch(`/api/projects/${projectId}/members/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId }),
    });
    if (!resp.ok) return parseError(resp);
}
