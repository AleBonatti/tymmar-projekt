import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Schema di validazione parametri
const ParamsSchema = z.object({
    id: z.string().uuid("ID progetto non valido"),
});

// Helper per errori JSON
function jsonError(res: VercelResponse, status: number, message: string): void {
    res.status(status).json({ error: message });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    try {
        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            return jsonError(res, 405, "Metodo non consentito");
        }

        const parsed = ParamsSchema.safeParse(req.query);
        if (!parsed.success) return jsonError(res, 400, parsed.error.issues[0]?.message ?? "ID non valido");
        const { id } = parsed.data;

        // Autenticazione: estrai token JWT
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return jsonError(res, 401, "Token mancante");

        // ENV check
        const url = process.env.SUPABASE_URL;
        const anon = process.env.SUPABASE_ANON_KEY;
        const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !anon || !service) {
            console.error("[get] Env mancanti:", { url: !!url, anon: !!anon, service: !!service });
            return jsonError(res, 500, "Configurazione server incompleta (ENV mancanti)");
        }

        // Verifica utente e ruolo
        const adminClient = createClient(url, service);
        const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
        if (userErr || !userData?.user) return jsonError(res, 401, "Token non valido o scaduto");

        const role = (userData.user.user_metadata as Record<string, unknown>)?.role;
        if (role !== "admin") return jsonError(res, 403, "Accesso negato: solo amministratori");

        // Query RLS-friendly (autenticato con anon + JWT)
        const supabase = createClient(url, anon, {
            global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();

        if (error) {
            console.error("[get] supabase error", error);
            return jsonError(res, 404, error.message);
        }
        if (!data) return jsonError(res, 404, "Progetto non trovato");

        res.status(200).json({ project: data });
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore interno del server";
        console.error("[get] unhandled error", e);
        jsonError(res, 500, message);
    }
}
