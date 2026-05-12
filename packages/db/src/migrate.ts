/**
 * Programmatic migration runner — use this instead of `drizzle-kit migrate`
 * which hangs on Neon due to a pg client connection not closing cleanly.
 *
 * Run: bun ./src/migrate.ts
 */

import path from "node:path";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

dotenv.config({ path: path.resolve(process.cwd(), "../../apps/web/.env") });

const databaseUrl = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL_DIRECT or DATABASE_URL must be set");
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

console.log("▶ Running migrations...");
await migrate(db, { migrationsFolder: "./src/migrations" });
console.log("✅ Migrations applied successfully");

process.exit(0);
