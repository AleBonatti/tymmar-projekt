export type ProjectStatus = "planned" | "active" | "paused" | "" | "cancelled";

export interface Project {
    id: string;
    title: string;
    description: string | null;
    start_date: string | null; // ISO date (YYYY-MM-DD)
    end_date: string | null; // ISO date
    progress: number; // 0..100
    status: ProjectStatus;
    created_by?: string; // auth.users.id
    created_at?: string;
    updated_at?: string;
}

/* export interface ProjectMember {
    project_id: string;
    user_id: string;
    added_at: string;
} */

export interface CreateProjectInput {
    title: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    progress?: number; // default 0
    status?: ProjectStatus; // default 'planned'
}

export interface UpdateProjectPatch {
    title?: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    progress?: number;
    status?: ProjectStatus;
}
