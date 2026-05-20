import fs from "node:fs";
import path from "node:path";
import { env } from "@ampliq/env/server";
import { type NextRequest, NextResponse } from "next/server";

const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	// Sanitize ID
	if (!ID_REGEX.test(id)) {
		return new NextResponse("Invalid ID", { status: 400 });
	}

	const filePath = path.join(env.YT_DLP_TEMP_DIR, `ampliq_${id}.mp3`);

	if (!fs.existsSync(filePath)) {
		return new NextResponse("File not found", { status: 404 });
	}

	const stats = fs.statSync(filePath);

	// Use ReadableStream for better performance
	const stream = fs.createReadStream(filePath);

	return new NextResponse(stream as unknown as ReadableStream, {
		headers: {
			"Content-Type": "audio/mpeg",
			"Content-Length": stats.size.toString(),
			"Accept-Ranges": "bytes",
		},
	});
}
