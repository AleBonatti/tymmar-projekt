import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../../_lib/auth.js";
import { getSupabaseRLS } from "../../../_lib/supabase.js";
import { sendError, parseZodError } from "../../../_lib/errors.js";
import { MemberActionSchema } from "../../schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token } = await requireAuthAdmin(req);
        const id = typeof req.query.id === "string" ? req.query.id : "";
        if (!id) return sendError(res, 400, "ID progetto mancante");

        const body = MemberActionSchema.parse(req.body);

        const supabase = getSupabaseRLS(token);
        const { error } = await supabase.from("project_members").delete().eq("project_id", id).eq("user_id", body.user_id);

        if (error) return sendError(res, 400, error.message);
        res.status(204).end();
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Payload non valido" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
