import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getSupabaseAdmin, getSupabaseRLS } from "../_lib/supabase.js";
import { requireAuthAdmin } from "../_lib/auth.js";
import { sendError, parseZodError } from "../_lib/errors.js";

const Role = z.enum(["admin", "user"]);
const CreateSchema = z.object({
    email: z.string().email("Email non valida"),
    role: Role,
    full_name: z.string().trim().max(200).optional().nullable(),
    username: z.string().trim().max(100).optional().nullable(),
    send_invite: z.boolean().optional(), // se true, invia email invito
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        const { token } = await requireAuthAdmin(req);
        const input = CreateSchema.parse(req.body);

        const admin = getSupabaseAdmin();

        // 1) Crea utente in Auth con ruolo nei metadata
        let userId: string | null = null;
        if (input.send_invite) {
            const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, { data: { role: input.role } });
            if (error || !data?.user) return sendError(res, 400, error?.message ?? "Invito fallito");
            userId = data.user.id;
        } else {
            const { data, error } = await admin.auth.admin.createUser({
                email: input.email,
                email_confirm: false,
                user_metadata: { role: input.role },
            });
            if (error || !data.user) return sendError(res, 400, error?.message ?? "Creazione utente fallita");
            userId = data.user.id;
        }

        // 2) Inserisci profilo
        const supabase = getSupabaseRLS(token);
        const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .insert({
                id: userId,
                user_id: userId,
                email: input.email,
                full_name: input.full_name ?? null,
                username: input.username ?? null,
                role: input.role,
            })
            .select()
            .single();
        if (pErr) return sendError(res, 400, pErr.message);

        // 3) (opzionale) link reset password da mostrare in backoffice
        let recovery_link: string | null = null;
        if (!input.send_invite) {
            const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
                type: "recovery",
                email: input.email,
            });
            if (!linkErr && linkData?.properties?.action_link) recovery_link = linkData.properties.action_link;
        }

        res.status(201).json({ account: profile, recovery_link });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Payload non valido" ? (e as { message?: string })?.message ?? msg : msg;
        sendError(res, 400, text);
    }
}
