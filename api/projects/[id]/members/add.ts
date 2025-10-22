import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../../_lib/auth.js";
import { sendError, parseZodError } from "../../../_lib/errors.js";
import { employeeProjects } from "../../../_lib/schema.js";
import { MemberActionSchema } from "../../schema.js";
import { z } from "zod";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// 🔸 Parametri da URL (es. /api/projects/[id]/members/add)
const ParamsSchema = z.object({
    id: z.coerce.number().int().positive("Invalid project ID"),
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        // 1️⃣ Verifica autenticazione e ruolo admin
        await requireAuthAdmin(req);

        // 2️⃣ Validazione ID progetto
        const parsed = ParamsSchema.safeParse(req.query);
        if (!parsed.success) {
            return sendError(res, 400, parsed.error.issues[0]?.message ?? "Invalid ID");
        }
        const { id: project_id } = parsed.data;

        // 3️⃣ Validazione body
        const body = MemberActionSchema.parse(req.body);
        const { user_id } = body;

        // 4️⃣ Inserimento nuovo membro
        const [inserted] = await db.insert(employeeProjects).values({ project_id, user_id }).returning();

        // 6️⃣ Verifica risultato
        if (!inserted) {
            return sendError(res, 500, "Errore creazione progetto");
        }

        // 7️⃣ OK
        res.status(201).json({ project: inserted });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Invalid payload" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
