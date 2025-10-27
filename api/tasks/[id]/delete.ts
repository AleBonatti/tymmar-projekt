// api/tasks/[id]/delete.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError } from "../../_lib/errors.js";
import { tasks } from "../../_lib/schema.tasks.js";
import { eq } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return sendError(res, 405, "Metodo non consentito");
    }
    await requireAuthAdmin(req);
    const id = Number(req.query.id);
    if (!id) return sendError(res, 400, "ID task mancante");

    const del = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (del.length === 0) return sendError(res, 404, "Task non trovato");

    res.status(204).end();
}
