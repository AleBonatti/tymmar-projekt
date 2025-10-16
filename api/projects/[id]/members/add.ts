import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../../_lib/auth";
import { getSupabaseRLS } from "../../../_lib/supabase";
import { sendError, parseZodError } from "../../../_lib/errors";
import { MemberActionSchema } from "../../schema";

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
        const { data, error } = await supabase.from("project_members").insert({ project_id: id, user_id: body.user_id }).select().single();

        if (error) return sendError(res, 400, error.message);
        res.status(201).json({ member: data });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Payload non valido" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
