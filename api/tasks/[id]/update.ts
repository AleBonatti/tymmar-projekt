// api/tasks/[id]/update.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError, parseZodError } from "../../_lib/errors.js";
import { tasks } from "../../_lib/schema.tasks.js";
import { UpdateTaskSchema } from "../schema.js";
import { eq } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        await requireAuthAdmin(req);
        const id = Number(req.query.id);
        if (!id) return sendError(res, 400, "ID task mancante");

        const patch = UpdateTaskSchema.parse(req.body);

        const set = {
            ...(patch.title !== undefined && { title: patch.title }),
            ...(patch.description !== undefined && { description: patch.description }),
            ...(patch.status !== undefined && { status: patch.status }),
            ...(patch.priority !== undefined && { priority: patch.priority }),
            ...(patch.assignee_id !== undefined && { assignee_id: patch.assignee_id }),
            ...(patch.due_date !== undefined && { due_date: patch.due_date ? new Date(patch.due_date) : null }),
            ...(patch.milestone_id !== undefined && { milestone_id: patch.milestone_id }),
            ...(patch.order_index !== undefined && { order_index: patch.order_index }),
            ...(patch.is_archived !== undefined && { is_archived: patch.is_archived }),
        };

        const [updated] = await db.update(tasks).set(set).where(eq(tasks.id, id)).returning();
        if (!updated) return sendError(res, 404, "Task non trovato");

        res.status(200).json({ task: updated });
    } catch (e) {
        return sendError(res, 400, parseZodError(e));
    }
}
