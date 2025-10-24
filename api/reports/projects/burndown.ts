// api/reports/projects/burndown.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth";
import { sendError } from "../../_lib/errors";

import { tasks } from "../../_lib/schema.tasks";
import { sql } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// Nota: per un burndown robusto servirebbero eventi (created/done date).
// Qui facciamo una stima contando i done per giorno via updated_at.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }
    await requireAuthAdmin(req);
    const project_id = Number(req.query.project_id);
    if (!project_id) return sendError(res, 400, "project_id mancante");

    const rows = await db.execute<{ day: string; total: number; done: number }>(sql`
    with days as (
      select generate_series(
        (select min(created_at)::date from ${tasks} where project_id = ${project_id}),
        (select greatest(max(updated_at), now())::date from ${tasks} where project_id = ${project_id}),
        interval '1 day'
      )::date as day
    )
    select d.day::text as day,
           (select count(*) from ${tasks} t where t.project_id = ${project_id} and t.created_at::date <= d.day)::int as total,
           (select count(*) from ${tasks} t where t.project_id = ${project_id} and t.status = 'done' and t.updated_at::date <= d.day)::int as done
    from days d
    order by d.day asc
  `);

    res.status(200).json({ points: rows.rows });
}
