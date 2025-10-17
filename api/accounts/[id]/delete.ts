import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { getSupabaseAdmin } from "../../_lib/supabase.js";
import { sendError } from "../../_lib/errors.js";

const Params = z.object({ id: z.string().uuid("ID non valido") });

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        await requireAuthAdmin(req);
        const params = Params.parse(req.query);

        const admin = getSupabaseAdmin();
        const { error } = await admin.auth.admin.deleteUser(params.id);
        if (error) return sendError(res, 400, error.message);

        res.status(204).end();
    } catch (e) {
        const msg = (e as { message?: string })?.message ?? "Errore server";
        sendError(res, 400, msg);
    }
}
