import { z } from "zod";

// Helper YYYY-MM-DD
const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida (formato YYYY-MM-DD)")
    .optional()
    .nullable();

export const ProjectStatus = z.enum(["planned", "active", "paused", "done", "cancelled"]);

export const CreateProjectSchema = z.object({
    title: z.string().trim().min(3, "Titolo troppo corto (min 3)"),
    description: z.string().trim().max(10000, "Descrizione troppo lunga").optional().nullable(),
    start_date: isoDate,
    end_date: isoDate,
    progress: z.number().int().min(0, "Progresso minimo 0").max(100, "Progresso massimo 100").optional(),
    status: ProjectStatus.default("planned"),
});

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
    title: z.string().trim().min(3, "Titolo troppo corto (min 3)").optional(),
    description: z.string().trim().max(10000, "Descrizione troppo lunga").optional().nullable(),
    start_date: isoDate,
    end_date: isoDate,
    progress: z.number().int().min(0, "Progresso minimo 0").max(100, "Progresso massimo 100").optional(),
    status: ProjectStatus.optional(),
});

export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;

export const MemberActionSchema = z.object({
    user_id: z.string().uuid("user_id non valido"),
});

export type MemberActionDTO = z.infer<typeof MemberActionSchema>;
