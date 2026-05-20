import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		JAMENDO_CLIENT_ID: z.string().min(1),
		YT_DLP_MAX_FILE_SIZE_MB: z.coerce.number().default(50),
		YT_DLP_TEMP_DIR: z.string().default("/tmp"),
		YT_DLP_DOWNLOAD_TIMEOUT_SEC: z.coerce.number().default(30),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
