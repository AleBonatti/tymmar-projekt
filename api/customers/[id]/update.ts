import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError, parseZodError } from "../../_lib/errors.js";
import { customers } from "../../_lib/schema.js";
import { eq } from "drizzle-orm";
import { UpdateCustomerSchema } from "../schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? "";
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

/** Se l'id è intero: */
const ParamsSchema = z.object({
    id: z.coerce.number().int().positive("ID progetto non valido"),
});

/** Helper: crea un oggetto “set” solo con i campi definiti e mappa i nomi corretti */
function buildPatch(patch: z.infer<typeof UpdateCustomerSchema>) {
    // Mapping: dal payload (snake_case) alle colonne drizzle
    // ATTENZIONE ai tipi: se arrivano stringhe ISO, converto a Date
    const set: Record<string, unknown> = {};

    if (patch.title !== undefined) set.title = patch.title;
    if (patch.description !== undefined) set.description = patch.description ?? null;

    // se hai campi come updated_at nel DB con default via trigger puoi ometterli
    return set;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return sendError(res, 405, "Metodo non consentito");
    }

    try {
        // 1) Auth admin
        await requireAuthAdmin(req);

        // 2) Parse id (da querystring)
        const parsedParams = ParamsSchema.safeParse(req.query);
        if (!parsedParams.success) {
            const msg = parsedParams.error.issues[0]?.message ?? "ID non valido";
            return sendError(res, 400, msg);
        }
        const { id } = parsedParams.data;

        // 3) Parse body (Zod)
        const patch = UpdateCustomerSchema.parse(req.body);

        // 5) Costruisci SET coerente con schema
        const set = buildPatch(patch);
        if (Object.keys(set).length === 0) {
            return sendError(res, 400, "Nessun campo da aggiornare");
        }

        // 6) Update con returning
        const [updated] = await db.update(customers).set(set).where(eq(customers.id, id)).returning();

        if (!updated) {
            return sendError(res, 404, "Customer not found");
        }

        // 7) OK
        res.status(200).json({ customer: updated });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Invalid payload" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
