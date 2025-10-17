import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { getSupabaseRLS } from "../../_lib/supabase.js";
import { sendError, parseZodError } from "../../_lib/errors.js";
import { UpdateProjectSchema } from "../schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token } = await requireAuthAdmin(req);
        const id = typeof req.query.id === "string" ? req.query.id : "";
        if (!id) return sendError(res, 400, "ID progetto mancante");

        const patch = UpdateProjectSchema.parse(req.body);
        if (patch.start_date && patch.end_date && patch.start_date > patch.end_date) {
            return sendError(res, 400, "La data di inizio non può essere successiva alla data di fine");
        }

        const supabase = getSupabaseRLS(token);
        const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select().single();
        if (error) return sendError(res, 400, error.message);

        res.status(200).json({ project: data });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Payload non valido" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
