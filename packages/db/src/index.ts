import { env } from "@ampliq/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema/users";

const schema = { users };

export function createDb() {
	const sql = neon(env.DATABASE_URL);
	return drizzle(sql, { schema, casing: "snake_case" });
}

export const db = createDb();
