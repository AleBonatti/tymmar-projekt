import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth.ts";
import { getSupabaseRLS } from "../_lib/supabase.ts";
import { sendError, parseZodError } from "../_lib/errors.ts";
import { CreateProjectSchema } from "./schema.ts";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token, user } = await requireAuthAdmin(req);
        const input = CreateProjectSchema.parse(req.body);
        if (input.start_date && input.end_date && input.start_date > input.end_date) {
            return sendError(res, 400, "La data di inizio non può essere successiva alla data di fine");
        }

        const supabase = getSupabaseRLS(token);
        const payload = {
            title: input.title,
            description: input.description ?? null,
            start_date: input.start_date ?? null,
            end_date: input.end_date ?? null,
            progress: input.progress ?? 0,
            status: input.status ?? "planned",
            // created_by verrà impostato dal trigger DB, ma possiamo impostarlo esplicitamente:
            created_by: user.id,
        };

        const { data, error } = await supabase.from("projects").insert(payload).select().single();
        if (error) return sendError(res, 400, error.message);

        res.status(201).json({ project: data });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Payload non valido" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
