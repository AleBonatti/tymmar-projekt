// src/lib/apiFetch.ts
import { supabase } from "../modules/supabase/client";

export async function apiFetch(input: string | URL | Request, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);

    // Imposta header JSON se manca
    if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
    }

    // Se hai autenticazione JWT, recupera dal localStorage o cookie
    //const token = localStorage.getItem("auth_token"); // adattalo al tuo sistema
    const token = await supabase.auth.getSession().then((r) => r.data.session?.access_token);
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(input, { ...init, headers });

    // Error handling base
    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const data = await response.json();
            message = data.error || data.message || message;
        } catch {
            /* risposta non JSON */
        }
        throw new Error(message);
    }

    return response;
}
