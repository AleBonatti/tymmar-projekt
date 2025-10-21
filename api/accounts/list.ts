import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth.js";
import { getSupabaseRLS } from "../_lib/supabase.js";
import { sendError } from "../_lib/errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        const { token } = await requireAuthAdmin(req);
        const supabase = getSupabaseRLS(token);
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

        let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (q) {
            query = query.or(`email.ilike.%${q}%,username.ilike.%${q}%,full_name.ilike.%${q}%`);
        }
        const { data, error } = await query;
        if (error) return sendError(res, 400, error.message);

        res.status(200).json({ accounts: data ?? [] });
    } catch (e) {
        const msg = (e as { message?: string })?.message ?? "Errore server";
        sendError(res, 401, msg);
    }
}
