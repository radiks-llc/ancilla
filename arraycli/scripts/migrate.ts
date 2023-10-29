import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";

const betterSqlite = new Database("sqlite.db");
const db = drizzle(betterSqlite);

migrate(db, { migrationsFolder: "drizzle" });
