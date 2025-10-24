export type ProjectStatus = "planned" | "active" | "paused" | "" | "cancelled";

export interface Project {
    id: string;
    customer_id: number | null;
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
