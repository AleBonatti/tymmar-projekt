import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthAdmin } from "../_lib/auth.js";
import { sendError, parseZodError } from "../_lib/errors.js";
import { customers } from "../_lib/schema.js";
import { CreateCustomerSchema } from "./schema.js";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        // 1️⃣ Verifica autenticazione e ruolo admin
        const { user } = await requireAuthAdmin(req);

        // 2️⃣ Validazione Zod (input del body)
        const input = CreateCustomerSchema.parse(req.body);

        // 4️⃣ Creazione payload coerente con le colonne del DB
        const payload = {
            title: input.title,
            description: input.description ?? null,
            created_by: user.id, // se esiste la colonna created_by
        };

        // 5️⃣ Inserimento con Drizzle
        const [inserted] = await db.insert(customers).values(payload).returning();

        // 6️⃣ Verifica risultato
        if (!inserted) {
            return sendError(res, 500, "Error on customer creation");
        }

        // 7️⃣ OK
        res.status(201).json({ customer: inserted });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Invalid payload" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
