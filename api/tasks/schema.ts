// api/tasks/schema.ts
import { z } from "zod";

export const TaskStatusEnum = z.enum(["todo", "in_progress", "blocked", "done"]);
export const TaskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

const DateLike = z.union([z.date(), z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).transform((v) => {
    if (v instanceof Date) return v;
    // "YYYY-MM-DD" → evita shift di timezone: crea Date locale a mezzanotte
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + "T00:00:00");
    // ISO → Date standard
    return new Date(v);
});

export const CreateTaskSchema = z.object({
    project_id: z.coerce.number().int().positive(),
    milestone_id: z.coerce.number().int().positive().optional().nullable(),
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    assignee_id: z.string().uuid().optional().nullable(),
    due_date: DateLike.nullable().optional(), //z.string().datetime().optional().nullable(), // ISO
    order_index: z.coerce.number().int().optional(),
});

export const UpdateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    assignee_id: z.string().uuid().optional().nullable(),
    due_date: DateLike.nullable().optional(), //z.string().datetime().optional().nullable(),
    milestone_id: z.coerce.number().int().positive().optional().nullable(),
    order_index: z.coerce.number().int().optional(),
    is_archived: z.boolean().optional(),
});

export const ListTasksQuerySchema = z.object({
    project_id: z.coerce.number().int().positive(),
    q: z.string().optional(),
    status: TaskStatusEnum.optional(),
});

export const ReorderTaskSchema = z.object({
    id: z.coerce.number().int().positive(),
    status: TaskStatusEnum.optional(),
    order_index: z.coerce.number().int(),
});
