import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../_lib/auth.js";
import { sendError } from "../_lib/errors.js";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { desc, ilike } from "drizzle-orm";
import { customers } from "../_lib/schema.js";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

/* ========== Validazione querystring ========== */
const QuerySchema = z.object({
    q: z.string().trim().optional().default(""),
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        // 1️⃣ Autenticazione admin
        await requireAuthAdmin(req);

        // 2️⃣ Validazione parametri
        const parsed = QuerySchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Parametri non validi";
            return sendError(res, 400, msg);
        }
        const { q } = parsed.data;

        // 3️⃣ Connessione DB
        if (!db) {
            return sendError(res, 500, "Configurazione DB mancante (SUPABASE_DB_URL o POSTGRES_URL)");
        }

        // 4️⃣ Query Drizzle
        let rows;
        if (q.length > 0) {
            rows = await db
                .select()
                .from(customers)
                .where(ilike(customers.title, `%${q}%`))
                .orderBy(desc(customers.created_at));
        } else {
            rows = await db.select().from(customers).orderBy(desc(customers.created_at));
        }

        // 5️⃣ Risposta OK
        res.status(200).json({ customers: rows ?? [] });
    } catch (e) {
        const msg = (e as { message?: string })?.message ?? "Errore server";
        if (/Unauthorized/i.test(msg) || /token/i.test(msg)) {
            return sendError(res, 401, msg);
        }
        if (/Forbidden/i.test(msg) || /solo amministratori/i.test(msg)) {
            return sendError(res, 403, msg);
        }
        return sendError(res, 500, msg);
    }
}
