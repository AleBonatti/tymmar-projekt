import { z } from "zod";

// Helper YYYY-MM-DD
/* const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (format YYYY-MM-DD)")
    .optional()
    .nullable(); */

// accetta: Date | "YYYY-MM-DD" | ISO string | null/undefined
const DateLike = z.union([z.date(), z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).transform((v) => {
    if (v instanceof Date) return v;
    // "YYYY-MM-DD" → evita shift di timezone: crea Date locale a mezzanotte
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + "T00:00:00");
    // ISO → Date standard
    return new Date(v);
});

export const ProjectStatus = z.enum(["planned", "active", "paused", "completed", "cancelled"]);

export const CreateProjectSchema = z.object({
    customer_id: z.number().int().positive("invalid user_id").nullable(),
    title: z.string().trim().min(3, "Title too short (min 3)"),
    description: z.string().trim().max(10000, "Description too long").optional().nullable(),
    start_date: DateLike.nullable().optional(),
    end_date: DateLike.nullable().optional(),
    progress: z.number().int().min(0, "Min progress: 0").max(100, "Max progress: 100").optional(),
    status: ProjectStatus.default("planned"),
});

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
    customer_id: z.number().int().positive("invalid user_id").nullable(),
    title: z.string().trim().min(3, "Title too short (min 3)").optional(),
    description: z.string().trim().max(10000, "Description too long").optional().nullable(),
    start_date: DateLike.nullable().optional(),
    end_date: DateLike.nullable().optional(),
    progress: z.number().int().min(0, "Min progress: 0").max(100, "Max progress: 100").optional(),
    status: ProjectStatus.optional(),
});

export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;

export const MemberActionSchema = z.object({
    user_id: z.number().int().positive("invalid user_id"),
});

export type MemberActionDTO = z.infer<typeof MemberActionSchema>;
