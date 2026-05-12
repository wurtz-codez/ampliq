import { db } from "@ampliq/db";
import { users } from "@ampliq/db/schema/users";
import { env } from "@ampliq/env/server";
import { verifyWebhook, type WebhookEvent } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

const webhookDataSchema = z.object({
	id: z.string(),
	email_addresses: z
		.array(
			z.object({
				email_address: z.string().email(),
			})
		)
		.min(1),
	first_name: z.string().nullable().optional(),
	last_name: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
	let evt: WebhookEvent;

	try {
		// Use the secret from our env package
		evt = await verifyWebhook(req, env.CLERK_WEBHOOK_SECRET);
	} catch (err) {
		console.error("Webhook verification failed:", err);
		return new Response("Verification failed", { status: 400 });
	}

	const eventType = evt.type;

	if (evt.type === "user.created" || evt.type === "user.updated") {
		const result = webhookDataSchema.safeParse(evt.data);

		if (!result.success) {
			console.error("Invalid webhook data:", result.error);
			return new Response("Invalid data", { status: 400 });
		}

		const data = result.data;
		const { id } = data;
		const email = data.email_addresses[0].email_address;
		const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();

		await db
			.insert(users)
			.values({
				id,
				email,
				name,
			})
			.onConflictDoUpdate({
				target: users.id,
				set: {
					email,
					name,
				},
			});
	}

	if (eventType === "user.deleted") {
		const { id } = evt.data as { id: string };
		await db.delete(users).where(eq(users.id, id));
	}

	return new Response("OK", { status: 200 });
}
