import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { getSupabaseAdmin, getSupabaseRLS } from "../../_lib/supabase.js";
import { sendError, parseZodError } from "../../_lib/errors.js";

const Role = z.enum(["admin", "user"]);
const Params = z.object({ id: z.string().uuid("ID non valido") });
const Patch = z.object({
    role: Role.optional(),
    full_name: z.string().trim().max(200).optional().nullable(),
    username: z.string().trim().max(100).optional().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        const { token } = await requireAuthAdmin(req);
        const params = Params.parse(req.query);
        const patch = Patch.parse(req.body);

        const supabase = getSupabaseRLS(token);
        const { data, error } = await supabase.from("profiles").update(patch).eq("id", params.id).select().single();
        if (error) return sendError(res, 400, error.message);

        if (patch.role) {
            const admin = getSupabaseAdmin();
            const { error: uErr } = await admin.auth.admin.updateUserById(params.id, {
                user_metadata: { role: patch.role },
            });
            if (uErr) return sendError(res, 400, uErr.message);
        }

        res.status(200).json({ account: data });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Payload non valido" ? (e as { message?: string })?.message ?? msg : msg;
        sendError(res, 400, text);
    }
}
