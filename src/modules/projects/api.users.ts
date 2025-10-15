import { supabase } from "@/modules/supabase/client";

export interface EligibleUser {
    id: string; // profiles.id
    email: string | null;
    username: string | null;
    full_name: string | null;
    role: "user"; // forziamo il tipo
}

export async function searchEligibleUsers(q: string): Promise<EligibleUser[]> {
    // Solo profili con ruolo "user", filtro per email/username/nome
    const query = supabase.from("profiles").select("id,email,username,full_name,role").eq("role", "user").order("full_name", { ascending: true }) as unknown as {
        then: (onfulfilled: (value: { data: EligibleUser[] | null; error: { message: string } | null }) => void) => void;
    };

    if (q.trim().length > 0) {
        // NB: PostgREST non supporta OR multipli con il builder del client,
        // quindi usiamo un filtro testuale `or` via stringa.
        const filter = `role.eq.user,or(email.ilike.%${q}%,username.ilike.%${q}%,full_name.ilike.%${q}%)`;
        const { data, error } = await supabase.from("profiles").select("id,email,username,full_name,role").or(filter).order("full_name", { ascending: true });
        if (error) throw new Error(error.message);
        // Filtra di nuovo role=user in caso il server ignori l'ordine dell'or
        return (data ?? []).filter((u) => u.role === "user") as EligibleUser[];
    }

    return new Promise((resolve, reject) => {
        (query as unknown as Promise<{ data: EligibleUser[] | null; error: { message: string } | null }>).then(({ data, error }) => {
            if (error) reject(new Error(error.message));
            else resolve((data ?? []).filter((u) => u.role === "user"));
        });
    });
}
