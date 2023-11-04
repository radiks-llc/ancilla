import { InferSelectModel, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { text, blob, integer, sqliteTable } from "drizzle-orm/sqlite-core";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);

export const prompts = sqliteTable("prompts", {
  id: integer("id").primaryKey(),
  payload: text("payload", { mode: "json" }).$type<any>(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type Prompt = InferSelectModel<typeof prompts>;

db.run(sql`DROP TABLE prompts`);

db.run(sql`CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY,
    payload TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);
