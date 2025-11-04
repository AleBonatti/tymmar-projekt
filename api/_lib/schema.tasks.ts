// src/api/_lib/schema.tasks.ts
import { pgTable, integer, varchar, text, timestamp, pgEnum, boolean, serial, index, uuid } from "drizzle-orm/pg-core";
import { projects, employees } from "./schema.js"; // importa le tue tabelle esistenti
//import { relations } from "drizzle-orm";

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "blocked", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);

export const milestones = pgTable(
    "milestones",
    {
        id: serial("id").primaryKey(),
        project_id: integer("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 180 }).notNull(),
        description: text("description"),
        start_date: timestamp("start_date", { withTimezone: true }),
        due_date: timestamp("due_date", { withTimezone: true }),
        status: taskStatusEnum("status").default("todo").notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        byProject: index("milestones_project_idx").on(t.project_id),
    })
);

export const tasks = pgTable(
    "tasks",
    {
        id: serial("id").primaryKey(),
        project_id: integer("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        milestone_id: integer("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
        title: varchar("title", { length: 180 }).notNull(),
        description: text("description"),
        status: taskStatusEnum("status").default("todo").notNull(),
        priority: taskPriorityEnum("priority").default("medium").notNull(),
        assignee_id: uuid("assignee_id").references(() => employees.id, { onDelete: "set null" }),
        due_date: timestamp("due_date", { withTimezone: true }),
        order_index: integer("order_index").default(0).notNull(), // per Kanban
        is_archived: boolean("is_archived").default(false).notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        byProject: index("tasks_project_idx").on(t.project_id),
        byMilestone: index("tasks_milestone_idx").on(t.milestone_id),
        byAssignee: index("tasks_assignee_idx").on(t.assignee_id),
        byStatus: index("tasks_status_idx").on(t.status),
    })
);

export const taskComments = pgTable("task_comments", {
    id: serial("id").primaryKey(),
    task_id: integer("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
    author_id: uuid("author_id").references(() => employees.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// (opzionale) labels
export const labels = pgTable("labels", {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    color: varchar("color", { length: 16 }).default("#e2e8f0").notNull(),
});
export const taskLabels = pgTable(
    "task_labels",
    {
        task_id: integer("task_id")
            .notNull()
            .references(() => tasks.id, { onDelete: "cascade" }),
        label_id: integer("label_id")
            .notNull()
            .references(() => labels.id, { onDelete: "cascade" }),
    }
    /* (t) => ({
        // unique composite
    }) */
);
