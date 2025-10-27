import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError } from "../../_lib/errors.js";
import { tasks } from "../../_lib/schema.tasks.js"; // <-- importa la tabella tasks con status, project_id, is_archived
import { eq, and, sql } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

const QuerySchema = z.object({
    project_id: z.coerce.number().int().positive(),
    includeArchived: z
        .enum(["0", "1"])
        .optional()
        .transform((v) => v === "1"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        await requireAuthAdmin(req);

        const parsed = QuerySchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Parametri non validi";
            return sendError(res, 400, msg);
        }

        const { project_id, includeArchived } = parsed.data;

        const where = and(eq(tasks.project_id, project_id), includeArchived ? undefined : eq(tasks.is_archived, false));

        const rows = await db
            .select({
                status: tasks.status,
                count: sql<number>`count(*)::int`,
            })
            .from(tasks)
            .where(where)
            .groupBy(tasks.status);

        // Risposta: [{ status: "todo", count: 5 }, ...]
        res.status(200).json({ items: rows });
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        return sendError(res, 400, message);
    }
}
