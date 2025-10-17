import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { getSupabaseRLS } from "../../_lib/supabase.js";
import { sendError } from "../../_lib/errors.js";

const Params = z.object({ id: z.string().uuid("ID non valido") });

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        const { token } = await requireAuthAdmin(req);
        const parsed = Params.safeParse(req.query);
        if (!parsed.success) return sendError(res, 400, parsed.error.issues[0]?.message ?? "ID non valido");

        const supabase = getSupabaseRLS(token);
        const { data, error } = await supabase.from("profiles").select("*").eq("id", parsed.data.id).single();
        if (error) return sendError(res, 404, error.message);
        if (!data) return sendError(res, 404, "Account non trovato");

        res.status(200).json({ account: data });
    } catch (e) {
        sendError(res, 401, (e as { message?: string })?.message ?? "Errore server");
    }
}
