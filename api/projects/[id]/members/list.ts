import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../../_lib/auth.js";
import { sendError } from "../../../_lib/errors.js";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

import { employees, employeeProjects } from "../../../_lib/schema.js";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// ✅ Schema di validazione parametri (es. /api/projects/42/members)
const ParamsSchema = z.object({
    id: z.coerce.number().int().positive("Invalid project ID"),
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
        const parsed = ParamsSchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Invalid ID";
            return sendError(res, 400, msg);
        }
        const { id: projectId } = parsed.data;

        // 3️⃣ Query Drizzle — elenco membri associati a un progetto
        // Puoi usare join per ottenere anche i dati utente
        const members = await db
            .select({
                id: employees.id,
                name: employees.name,
                surname: employees.surname,
            })
            .from(employees)
            .leftJoin(employeeProjects, eq(employeeProjects.user_id, employees.id))
            .where(eq(employeeProjects.project_id, projectId));

        // 4️⃣ Risposta
        res.status(200).json({ members });
    } catch (e) {
        const message = (e as { message?: string })?.message ?? "Errore server";
        return sendError(res, 401, message);
    }
}
