// api/tasks/reorder.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth.js";
import { sendError, parseZodError } from "../_lib/errors.js";
import { tasks } from "../_lib/schema.tasks.js";
import { ReorderTaskSchema } from "./schema.js";
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
        const body = ReorderTaskSchema.parse(req.body);

        const set = {
            order_index: body.order_index,
            ...(body.status && { status: body.status }),
        };

        const [updated] = await db.update(tasks).set(set).where(eq(tasks.id, body.id)).returning();
        if (!updated) return sendError(res, 404, "Task non trovato");

        res.status(200).json({ task: updated });
    } catch (e) {
        return sendError(res, 400, parseZodError(e));
    }
}
