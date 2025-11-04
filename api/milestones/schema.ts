// src/api/milestones/schema.ts
import { z } from "zod";

export const CreateMilestoneSchema = z.object({
    project_id: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullish(),
    start_date: z.string().datetime().nullish(),
    due_date: z.string().datetime().nullish(),
    status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
});

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial().extend({
    id: z.number().int().positive(),
});
