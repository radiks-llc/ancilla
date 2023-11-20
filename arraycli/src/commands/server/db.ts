import { InferSelectModel, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);

export const prompts = sqliteTable("prompts", {
  id: integer("id").primaryKey(),
  path: text("path").notNull(),
  payload: text("payload", { mode: "json" }).notNull().$type<object>(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type Prompt = InferSelectModel<typeof prompts>;

db.run(sql`DROP TABLE prompts;`);

db.run(sql`CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY,
    payload TEXT NOT NULL,
    path TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
)`);
