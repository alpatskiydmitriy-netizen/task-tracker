import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Категории пользователь задаёт сам — отдельная таблица, чтобы был выбор из уже введённых
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),

  // not_started | in_progress | waiting | done | cancelled
  status: text("status").notNull().default("not_started"),

  // high | mid | low
  importance: text("importance").notNull().default("mid"),
  urgency: text("urgency").notNull().default("mid"),

  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  assignee: text("assignee"),
  dueDate: text("due_date"), // ISO date string (YYYY-MM-DD)

  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Category = typeof categories.$inferSelect;
