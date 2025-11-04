// src/modules/tasks/types.ts
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
    id: number;
    project_id: number;
    milestone_id: number | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assignee_id: string | null; // uuid
    due_date: string | null; // ISO
    order_index: number;
    is_archived: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTaskInput {
    project_id: number;
    milestone_id?: number | null;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: string | null;
    due_date?: string | null; // ISO
    order_index?: number;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: string | null;
    due_date?: string | null;
    milestone_id?: number | null;
    order_index?: number;
    is_archived?: boolean;
}
