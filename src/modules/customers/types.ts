export interface Customer {
    id: string;
    title: string;
    description: string | null;
    created_by?: string; // auth.users.id
    created_at?: string;
    updated_at?: string;
}
