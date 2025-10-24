// api/reports/tasks/status-summary.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth";
import { sendError } from "../../_lib/errors";

import { tasks } from "../../_lib/schema.tasks";
import { sql, eq } from "drizzle-orm";

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
    await requireAuthAdmin(req);
    const project_id = Number(req.query.project_id);
    if (!project_id) return sendError(res, 400, "project_id mancante");

    const rows = await db.execute<{ status: string; count: number }>(sql`select status, count(*)::int as count
        from ${tasks}
        where ${tasks.project_id} = ${project_id} and ${tasks.is_archived} = false
        group by status`);

    res.status(200).json({ items: rows.rows });
}
