import { z } from "zod";

export const CreateCustomerSchema = z.object({
    title: z.string().trim().min(3, "Title too short (min 3)"),
    description: z.string().trim().max(10000, "Description too long").optional().nullable(),
});

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = z.object({
    title: z.string().trim().min(3, "Title too short (min 3)").optional(),
    description: z.string().trim().max(10000, "Description too long").optional().nullable(),
});

export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
