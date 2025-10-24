// src/api/tasks/schema.ts
import { z } from "zod";

export const CreateTaskSchema = z.object({
    project_id: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullish(),
    status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignee_id: z.string().uuid().nullish(),
    due_date: z.string().datetime().nullish(), // ISO string (convertirai a Date)
    milestone_id: z.number().int().positive().nullish(),
    order_index: z.number().int().nullish(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    id: z.number().int().positive(),
});

export const ReorderTaskSchema = z.object({
    // per drag&drop tra colonne/status
    id: z.number().int().positive(),
    status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
    order_index: z.number().int(),
});
