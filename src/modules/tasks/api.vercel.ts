// src/modules/tasks/api.vercel.ts
import type { Task, CreateTaskInput, UpdateTaskInput } from "./types";
import { apiFetch } from "@/lib/apiFetch"; // wrapper fetch con token, error-handling

export async function apiListTasks(params: { project_id: number; q?: string; status?: Task["status"] }): Promise<Task[]> {
    const url = new URL("/api/tasks/list", window.location.origin);
    url.searchParams.set("project_id", String(params.project_id));
    if (params.q) url.searchParams.set("q", params.q);
    if (params.status) url.searchParams.set("status", params.status);
    const res = await apiFetch(url.toString());
    const json = await res.json();
    return json.items as Task[];
}

export async function apiCreateTask(input: CreateTaskInput): Promise<Task> {
    const res = await apiFetch("/api/tasks/create", {
        method: "POST",
        body: JSON.stringify(input),
    });
    const json = await res.json();
    return json.task as Task;
}

export async function apiUpdateTask(id: number, patch: UpdateTaskInput): Promise<Task> {
    const res = await apiFetch(`/api/tasks/${id}/update`, {
        method: "PATCH",
        body: JSON.stringify(patch),
    });
    const json = await res.json();
    return json.task as Task;
}

export async function apiDeleteTask(id: number): Promise<void> {
    await apiFetch(`/api/tasks/${id}/delete`, { method: "DELETE" });
}

export async function apiReorderTask(id: number, order_index: number, status?: Task["status"]): Promise<Task> {
    const res = await apiFetch(`/api/tasks/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ id, order_index, status }),
    });
    const json = await res.json();
    return json.task as Task;
}
