import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError } from "../../_lib/errors.js";
import { customers } from "../../_lib/schema.js";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// Se l'ID è numerico (int). Se usi UUID vedi la variante più sotto.
const ParamsSchema = z.object({
    id: z.coerce.number().int().positive("ID progetto non valido"),
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        // 1) Auth admin (se non ti serve il token, basta la verifica)
        await requireAuthAdmin(req);

        // 2) Validazione parametri
        const parsed = ParamsSchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Parametri non validi";
            return sendError(res, 400, msg);
        }
        const { id } = parsed.data;

        // 3) Delete con Drizzle
        // Usiamo returning() per sapere se qualcosa è stato effettivamente cancellato
        const deleted = await db.delete(customers).where(eq(customers.id, id)).returning();

        if (deleted.length === 0) {
            // Nessun record corrispondente
            return sendError(res, 404, "Client not found");
        }

        // 4) OK - nessun body
        res.status(204).end();
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        // mantengo la tua semantica originale sul 401 qui
        return sendError(res, 401, message);
    }
}
