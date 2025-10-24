// api/reports/milestones/progress.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth";
import { sendError } from "../../_lib/errors";

import { milestones, tasks } from "../../_lib/schema.tasks";
import { eq, sql } from "drizzle-orm";

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
    const rows = await db.execute<{ milestone_id: number; title: string; total: number; done: number }>(sql`
    select m.id as milestone_id, m.title,
           count(t.id)::int as total,
           count(*) filter (where t.status = 'done')::int as done
    from ${milestones} m
    left join ${tasks} t on t.milestone_id = m.id and t.is_archived = false
    where m.project_id = ${project_id}
    group by m.id, m.title
    order by m.start_date nulls last, m.id desc
  `);

    res.status(200).json({
        items: rows.rows.map((r) => ({
            milestone_id: r.milestone_id,
            title: r.title,
            total: r.total,
            done: r.done,
            progress: r.total > 0 ? Math.round((r.done / r.total) * 100) : 0,
        })),
    });
}
