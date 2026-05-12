import { env } from "@ampliq/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function createDb() {
	const sql = neon(env.DATABASE_URL);
	return drizzle(sql, { schema: {} });
}

export const db = createDb();
