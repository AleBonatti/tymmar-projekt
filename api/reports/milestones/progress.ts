// api/reports/milestones/progress.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth";
import { sendError } from "../../_lib/errors";

import { milestones, tasks } from "../../_lib/schema.tasks";
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

    // progress = done / total per milestone
    const rows = await db
        .select({
            milestone_id: milestones.id,
            title: milestones.title,
            total: sql<number>`count(${tasks.id})::int`,
            done: sql<number>`count(*) filter (where ${tasks.status} = 'done')::int`,
        })
        .from(milestones)
        .leftJoin(tasks, eq(tasks.milestone_id, milestones.id))
        .where(eq(milestones.project_id, project_id))
        .groupBy(milestones.id, milestones.title)
        .orderBy(milestones.start_date);

    res.status(200).json({
        items: rows.map((r) => ({
            milestone_id: r.milestone_id,
            title: r.title,
            total: r.total,
            done: r.done,
            progress: r.total > 0 ? Math.round((r.done / r.total) * 100) : 0,
        })),
    });
}
