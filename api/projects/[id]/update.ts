import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuthAdmin } from "../../_lib/auth.js";
import { sendError, parseZodError } from "../../_lib/errors.js";
import { projects } from "../../_lib/schema.js";
import { eq } from "drizzle-orm";
import { UpdateProjectSchema } from "../schema.js";
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
function buildPatch(patch: z.infer<typeof UpdateProjectSchema>) {
    // Mapping: dal payload (snake_case) alle colonne drizzle
    // ATTENZIONE ai tipi: se arrivano stringhe ISO, converto a Date
    const set: Record<string, unknown> = {};

    if (patch.title !== undefined) set.title = patch.title;
    if (patch.description !== undefined) set.description = patch.description ?? null;

    if (patch.start_date !== undefined) {
        set.start_date = patch.start_date ? new Date(patch.start_date) : null;
    }
    if (patch.end_date !== undefined) {
        set.end_date = patch.end_date ? new Date(patch.end_date) : null;
    }

    if (patch.progress !== undefined) set.progress = patch.progress;
    if (patch.status !== undefined) set.status = patch.status;

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
        const patch = UpdateProjectSchema.parse(req.body);

        // 4) Validazione logica date (se entrambe presenti nel payload)
        if (patch.start_date && patch.end_date && patch.start_date > patch.end_date) {
            return sendError(res, 400, "La data di inizio non può essere successiva alla data di fine");
        }

        // 5) Costruisci SET coerente con schema
        const set = buildPatch(patch);
        if (Object.keys(set).length === 0) {
            return sendError(res, 400, "Nessun campo da aggiornare");
        }

        // 6) Update con returning
        const [updated] = await db.update(projects).set(set).where(eq(projects.id, id)).returning();

        if (!updated) {
            return sendError(res, 404, "Progetto non trovato");
        }

        // 7) OK
        res.status(200).json({ project: updated });
    } catch (e) {
        const msg = parseZodError(e);
        const text = msg === "Invalid payload" ? (e as { message?: string })?.message ?? msg : msg;
        return sendError(res, 400, text);
    }
}
