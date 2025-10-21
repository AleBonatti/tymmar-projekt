import { supabase } from "@/modules/supabase/client";

export interface EligibleUser {
    id: string; // profiles.id
    name: string | null;
    surname: string | null;
}

export async function searchEligibleUsers(q: string): Promise<EligibleUser[]> {
    // Solo profili con ruolo "user", filtro per username/nome
    const query = supabase.from("employees").select("id,name,surname").order("surname", { ascending: true }) as unknown as {
        then: (onfulfilled: (value: { data: EligibleUser[] | null; error: { message: string } | null }) => void) => void;
    };

    if (q.trim().length > 0) {
        // NB: PostgREST non supporta OR multipli con il builder del client,
        // quindi usiamo un filtro testuale `or` via stringa.
        const filter = `name.ilike.%${q}%,surname.ilike.%${q}%`;
        const { error } = await supabase.from("employees").select("id,name,surname").or(filter).order("surname", { ascending: true });
        if (error) throw new Error(error.message);
    }

    return new Promise((resolve, reject) => {
        (query as unknown as Promise<{ data: EligibleUser[] | null; error: { message: string } | null }>).then(({ data, error }) => {
            if (error) reject(new Error(error.message));
            //else resolve((data ?? []).filter((u) => u.role === "user"));
            else resolve(data ?? []);
        });
    });
}
