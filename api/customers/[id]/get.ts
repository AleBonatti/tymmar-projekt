// api/projects/get.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError } from "../../_lib/errors.js";
import { customers } from "../../_lib/schema.js";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

/* =========================
   Validazione parametri
   (numerico intero positivo)
   Se id è UUID: usa z.string().uuid()
   ========================= */
const ParamsSchema = z.object({
    id: z.coerce.number().int().positive("Invalid project ID"),
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Method not allowed");
    }

    try {
        // 1) Auth (admin only)
        await requireAuthAdmin(req);

        // 2) Params
        const parsed = ParamsSchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Invalid params";
            return sendError(res, 400, msg);
        }
        const { id } = parsed.data;

        // 4) Query
        const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
        const customer = rows[0];
        if (!customer) return sendError(res, 404, "Project not found");

        // 5) OK
        res.status(200).json({ customer });
    } catch (e) {
        const msg = (e as { message?: string })?.message ?? "Internal server error";
        if (/Unauthorized/i.test(msg) || /token/i.test(msg)) return sendError(res, 401, msg);
        if (/Forbidden/i.test(msg) || /admin/i.test(msg)) return sendError(res, 403, msg);
        return sendError(res, 500, msg);
    }
}
