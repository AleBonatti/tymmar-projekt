// api/tasks/list.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth";
import { sendError } from "../_lib/errors";
import { tasks } from "../_lib/schema.tasks";
import { and, eq, ilike, or, desc } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        await requireAuthAdmin(req);
        const project_id = Number(req.query.project_id);
        if (!project_id) return sendError(res, 400, "project_id mancante");

        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const status = typeof req.query.status === "string" ? req.query.status : "";
        const where = and(eq(tasks.project_id, project_id), q ? or(ilike(tasks.title, `%${q}%`), ilike(tasks.description, `%${q}%`)) : undefined, status ? eq(tasks.status, status as any) : undefined, eq(tasks.is_archived, false));

        const rows = await db.select().from(tasks).where(where).orderBy(desc(tasks.order_index), desc(tasks.id));
        res.status(200).json({ items: rows });
    } catch (e) {
        return sendError(res, 400, (e as Error).message);
    }
}
