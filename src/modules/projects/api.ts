import { supabase } from "@/modules/supabase/client";
import type { Project, ProjectMember, CreateProjectInput, UpdateProjectPatch } from "./types";

// ===== Projects =====
export async function listProjects(search?: string): Promise<Project[]> {
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (search && search.trim().length > 0) {
        query = query.ilike("title", `%${search.trim()}%`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
}

export async function getProject(id: string): Promise<Project> {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data as Project;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
    const payload = {
        title: input.title,
        description: input.description ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        progress: input.progress ?? 0,
        status: input.status ?? "planned",
    };
    const { data, error } = await supabase.from("projects").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data as Project;
}

export async function updateProject(id: string, patch: UpdateProjectPatch): Promise<Project> {
    const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
}

// ===== Members =====
export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase.from("project_members").select("*").eq("project_id", projectId).order("added_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ProjectMember[];
}

export async function addProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
    const { data, error } = await supabase.from("project_members").insert({ project_id: projectId, user_id: userId }).select().single();
    if (error) throw new Error(error.message);
    return data as ProjectMember;
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);
    if (error) throw new Error(error.message);
}
