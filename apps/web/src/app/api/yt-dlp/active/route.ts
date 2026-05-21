import prisma from "@ampliq/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const tracks = await prisma.downloadedTrack.findMany({
			where: {
				expiresAt: {
					gt: new Date(),
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json({ tracks });
	} catch (error) {
		console.error("Failed to fetch active downloads:", error);
		return NextResponse.json(
			{ error: "Failed to fetch active downloads" },
			{ status: 500 }
		);
	}
}
