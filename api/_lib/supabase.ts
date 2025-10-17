import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    // In build-time su Vercel vedrai un warning utile se mancano variabili
    // (non lanciando eccezioni qui, gli endpoint possono comunque loggare errori chiari)
    console.warn("[supabase] Missing env vars: check SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY");
}

export function getSupabaseRLS(token: string): SupabaseClient {
    // Client “RLS-friendly”: le query rispettano RLS usando il JWT dell’utente
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: { Authorization: `Bearer ${token}` },
        },
    });
}

export function getSupabaseAdmin(): SupabaseClient {
    // Client admin: privilegio elevato (bypassa RLS).
    // Usalo solo per validazioni auth (getUser) o operazioni strettamente necessarie.
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
