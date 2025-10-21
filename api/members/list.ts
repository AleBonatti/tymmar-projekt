// api/employees/list.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../_lib/auth.js";
import { sendError } from "../_lib/errors.js";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { desc, ilike } from "drizzle-orm";

/* ========== Schema Drizzle (minimale) ==========
   Spostalo eventualmente in api/_lib/db/schema.ts
   e importalo da lì per riuso. */
export const employees = pgTable("employees", {
    id: integer("id").primaryKey(),
    name: text("name"),
    surname: text("surname"),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true }),
});

/* ========== Connessione DB (riusabile) ========== */
const connectionString = process.env.SUPABASE_URL ?? process.env.POSTGRES_URL ?? "";

const pool = connectionString ? new Pool({ connectionString }) : null;
const db = pool ? drizzle(pool) : null;

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
        // 1) Auth admin (bypassa se non admin)
        await requireAuthAdmin(req);

        // 2) Parse query ?q=
        const parsed = QuerySchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Parametri non validi";
            return sendError(res, 400, msg);
        }
        const { q } = parsed.data;

        // 3) Connessione DB
        if (!db) {
            return sendError(res, 500, "Configurazione DB mancante: set SUPABASE_DB_URL o POSTGRES_URL");
        }

        // 4) Query Drizzle (filtro opzionale per surname, ILIKE)
        const rows = await (q.length > 0
            ? db
                  .select()
                  .from(employees)
                  .where(ilike(employees.surname, `%${q}%`))
                  .orderBy(desc(employees.id))
            : db.select().from(employees).orderBy(desc(employees.id)));
        /* let query = db.select().from(employees);

        if (q.length > 0) {
            query = query.where(ilike(employees.surname, `%${q}%`));
        }

        const rows = await query.orderBy(desc(employees.id)); */

        // 5) Risposta
        res.status(200).json({ members: rows ?? [] });
    } catch (e) {
        console.log(e);
        const msg = (e as { message?: string })?.message ?? "Errore server";
        // Mappa errori più chiara (401 vs 403 vs 500)
        if (/Unauthorized/i.test(msg) || /token/i.test(msg)) {
            return sendError(res, 401, msg);
        }
        if (/Forbidden/i.test(msg) || /solo amministratori/i.test(msg)) {
            return sendError(res, 403, msg);
        }
        return sendError(res, 500, msg);
    }
}

/* import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth.js";
import { getSupabaseRLS } from "../_lib/supabase.js";
import { sendError } from "../_lib/errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        const { token } = await requireAuthAdmin(req);
        const supabase = getSupabaseRLS(token);
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

        let query = supabase.from("employees").select("*").order("id", { ascending: false });
        if (q.length > 0) {
            query = query.ilike("title", `%${q}%`);
        }

        const { data, error } = await query;
        if (error) return sendError(res, 400, error.message);

        res.status(200).json({ members: data ?? [] });
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        return sendError(res, 401, message);
    }
}
 */
