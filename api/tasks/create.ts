// api/tasks/create.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth";
import { sendError, parseZodError } from "../_lib/errors";
import { tasks } from "../_lib/schema.tasks";
import { CreateTaskSchema } from "./schema";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendError(res, 405, "Metodo non consentito");
    }
    try {
        await requireAuthAdmin(req);
        const input = CreateTaskSchema.parse(req.body);

        const payload = {
            project_id: input.project_id,
            title: input.title,
            description: input.description ?? null,
            status: input.status ?? "todo",
            priority: input.priority ?? "medium",
            assignee_id: input.assignee_id ?? null,
            due_date: input.due_date ? new Date(input.due_date) : null,
            milestone_id: input.milestone_id ?? null,
            order_index: input.order_index ?? 0,
        };

        const [inserted] = await db.insert(tasks).values(payload).returning();
        res.status(201).json({ task: inserted });
    } catch (e) {
        return sendError(res, 400, parseZodError(e));
    }
}
