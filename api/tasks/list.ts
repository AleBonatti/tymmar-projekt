// api/tasks/list.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth.js";
import { sendError } from "../_lib/errors.js";
import { tasks } from "../_lib/schema.tasks.js";
import { and, eq, ilike, or, desc } from "drizzle-orm";
import { ListTasksQuerySchema } from "./schema.js";

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
        const { project_id, q = "", status } = ListTasksQuerySchema.parse(req.query);

        const where = and(eq(tasks.project_id, project_id), q ? or(ilike(tasks.title, `%${q}%`), ilike(tasks.description, `%${q}%`)) : undefined, status ? eq(tasks.status, status) : undefined, eq(tasks.is_archived, false));

        const items = await db.select().from(tasks).where(where).orderBy(desc(tasks.order_index), desc(tasks.id));

        res.status(200).json({ items });
    } catch (e) {
        return sendError(res, 400, (e as Error).message);
    }
}
