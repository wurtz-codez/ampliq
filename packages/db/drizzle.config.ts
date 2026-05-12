import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: "../../apps/web/.env",
});

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		// Direct (non-pooler) URL — PgBouncer doesn't support the SET
		// commands that drizzle-kit uses for push/generate/migrate.
		url: process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL ?? "",
	},
});
