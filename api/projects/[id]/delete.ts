import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth";
import { getSupabaseRLS } from "../../_lib/supabase";
import { sendError } from "../../_lib/errors";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token } = await requireAuthAdmin(req);
        const id = typeof req.query.id === "string" ? req.query.id : "";
        if (!id) return sendError(res, 400, "ID progetto mancante");

        const supabase = getSupabaseRLS(token);
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) return sendError(res, 400, error.message);

        res.status(204).end();
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        return sendError(res, 401, message);
    }
}
