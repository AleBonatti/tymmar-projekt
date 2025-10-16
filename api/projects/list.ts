import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth";
import { getSupabaseRLS } from "../_lib/supabase";
import { sendError } from "../_lib/errors";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token } = await requireAuthAdmin(req);
        const supabase = getSupabaseRLS(token);
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

        let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
        if (q.length > 0) {
            query = query.ilike("title", `%${q}%`);
        }

        const { data, error } = await query;
        if (error) return sendError(res, 400, error.message);

        res.status(200).json({ projects: data ?? [] });
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        return sendError(res, 401, message);
    }
}
