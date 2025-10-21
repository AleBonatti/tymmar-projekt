// api/_lib/schema.ts
import { pgTable, integer, text, timestamp, numeric, uuid } from "drizzle-orm/pg-core";

/** Esempi — adatta ai tuoi */
export const employees = pgTable("employees", {
    id: integer("id").primaryKey(),
    name: text("name"),
    surname: text("surname"),
    email: text("email"),
    created_at: timestamp("created_at", { withTimezone: true }),
});

export const projects = pgTable("projects", {
    id: integer("id").primaryKey(), // o uuid("id").primaryKey()
    title: text("title").notNull(),
    description: text("description"),
    start_date: timestamp("start_date", { withTimezone: true }),
    end_date: timestamp("end_date", { withTimezone: true }),
    progress: numeric("progress"),
    status: text("status"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const employeeProjects = pgTable("employee_projects", {
    project_id: integer("project_id").notNull(), // o uuid
    user_id: uuid("user_id").notNull(),
    added_at: timestamp("added_at", { withTimezone: true }).defaultNow(),
});
