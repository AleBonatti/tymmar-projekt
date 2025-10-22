// api/_lib/schema.ts
import { pgTable, integer, text, timestamp, smallint, uuid } from "drizzle-orm/pg-core";

//const id = integer("id").generatedAlwaysAsIdentity().primaryKey();

/** Esempi — adatta ai tuoi */
export const employees = pgTable("employees", {
    id: integer("id").primaryKey(),
    name: text("name"),
    surname: text("surname"),
    //created_at: timestamp("created_at", { withTimezone: true }),
});

export const projects = pgTable("projects", {
    //id: integer("id").primaryKey(), // o uuid("id").primaryKey()
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    start_date: timestamp("start_date", { withTimezone: true }),
    end_date: timestamp("end_date", { withTimezone: true }),
    progress: smallint("progress").notNull().default(0), // => number//numeric("progress"),
    status: text("status"),
    created_by: uuid("created_by"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const employeeProjects = pgTable("employee_projects", {
    project_id: integer("project_id").notNull(), // o uuid
    user_id: integer("employee_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
