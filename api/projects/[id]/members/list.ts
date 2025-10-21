import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../../_lib/auth.js";
import { getSupabaseRLS } from "../../../_lib/supabase.js";
import { sendError } from "../../../_lib/errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token } = await requireAuthAdmin(req);
        const id = typeof req.query.id === "string" ? req.query.id : "";
        if (!id) return sendError(res, 400, "ID progetto mancante");

        const supabase = getSupabaseRLS(token);
        const { data, error } = await supabase.from("employee_projects").select("*").eq("project_id", id);

        if (error) return sendError(res, 400, error.message);
        res.status(200).json({ members: data ?? [] });
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        return sendError(res, 401, message);
    }
}
