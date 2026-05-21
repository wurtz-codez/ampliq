import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import prisma from "@ampliq/db";
import { env } from "@ampliq/env/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const PROGRESS_REGEX = /\[download\]\s+(\d+\.\d+)%/;

interface TrackMetadata {
	channel?: string;
	duration: number;
	id: string;
	thumbnail: string;
	title: string;
	uploader?: string;
}

function cleanupTempFiles(requestId: string) {
	try {
		const files = fs.readdirSync(env.YT_DLP_TEMP_DIR);
		const now = Date.now();
		for (const file of files) {
			if (file.startsWith("ampliq_") && file.endsWith(".mp3")) {
				const filePath = path.join(env.YT_DLP_TEMP_DIR, file);
				const stats = fs.statSync(filePath);
				if (now - stats.mtimeMs > 30 * 60 * 1000) {
					fs.unlinkSync(filePath);
				}
			}
		}
	} catch (e) {
		console.error(`[${requestId}] Temp file cleanup error:`, e);
	}
}

async function cleanupExpiredDbRecords(requestId: string) {
	try {
		const deleted = await prisma.downloadedTrack.deleteMany({
			where: { expiresAt: { lte: new Date() } },
		});
		if (deleted.count > 0) {
			console.log(
				`[${requestId}] Cleaned up ${deleted.count} expired DB records`
			);
		}
	} catch (e) {
		console.error(`[${requestId}] DB cleanup error:`, e);
	}
}

function fetchMetadata(
	videoId: string,
	requestId: string
): Promise<TrackMetadata> {
	return new Promise<TrackMetadata>((resolve, reject) => {
		let yt: ChildProcess | undefined;

		try {
			yt = spawn("yt-dlp", [
				"--dump-json",
				"--no-playlist",
				`https://www.youtube.com/watch?v=${videoId}`,
			]);
		} catch (e) {
			console.error(`[${requestId}] Failed to spawn yt-dlp for metadata:`, e);
			reject(e);
			return;
		}

		if (!yt) {
			reject(new Error("Failed to spawn yt-dlp"));
			return;
		}

		let output = "";
		let errorOutput = "";

		yt.stdout?.on("data", (data: Buffer) => {
			output += data.toString();
		});

		yt.stderr?.on("data", (data: Buffer) => {
			errorOutput += data.toString();
		});

		yt.on("error", (err: Error) => {
			console.error(
				`[${requestId}] yt-dlp metadata process error:`,
				err.message
			);
			reject(err);
		});

		yt.on("close", (code) => {
			if (code !== 0) {
				const msg = `yt-dlp metadata exited with code ${code}`;
				console.error(
					`[${requestId}] ${msg}. stderr: ${errorOutput.slice(0, 500)}`
				);
				reject(new Error(`${msg}: ${errorOutput}`));
				return;
			}
			try {
				resolve(JSON.parse(output) as TrackMetadata);
			} catch (e) {
				console.error(
					`[${requestId}] Failed to parse yt-dlp metadata JSON:`,
					e
				);
				reject(e);
			}
		});
	});
}

function downloadAudio(
	videoId: string,
	filePath: string,
	requestId: string,
	onProgress: (progress: number) => void
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let download: ChildProcess | undefined;

		try {
			download = spawn("yt-dlp", [
				"-f",
				"bestaudio",
				"--extract-audio",
				"--audio-format",
				"mp3",
				"--no-playlist",
				"-o",
				filePath,
				`https://www.youtube.com/watch?v=${videoId}`,
			]);
		} catch (e) {
			console.error(`[${requestId}] Failed to spawn yt-dlp for download:`, e);
			reject(e);
			return;
		}

		if (!download) {
			reject(new Error("Failed to spawn yt-dlp"));
			return;
		}

		let stderrBuf = "";

		download.stdout?.on("data", (data: Buffer) => {
			const str = data.toString();
			const match = str.match(PROGRESS_REGEX);
			if (match?.[1]) {
				onProgress(Number.parseFloat(match[1]));
			}
		});

		download.stderr?.on("data", (data: Buffer) => {
			stderrBuf += data.toString();
		});

		download.on("error", (err: Error) => {
			console.error(
				`[${requestId}] yt-dlp download process error:`,
				err.message
			);
			reject(err);
		});

		download.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				const msg = `yt-dlp download exited with code ${code}`;
				console.error(
					`[${requestId}] ${msg}. stderr: ${stderrBuf.slice(0, 1000)}`
				);
				reject(new Error(`${msg}: ${stderrBuf}`));
			}
		});
	});
}

export async function POST(req: NextRequest) {
	const { videoId } = await req.json();

	if (!videoId || typeof videoId !== "string") {
		return Response.json({ error: "Invalid videoId" }, { status: 400 });
	}

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const send = (data: object) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			const requestId = `dl-${videoId.slice(0, 8)}-${Date.now()}`;

			try {
				cleanupTempFiles(requestId);
				await cleanupExpiredDbRecords(requestId);

				const metadata = await fetchMetadata(videoId, requestId);

				console.log(
					`[${requestId}] Found: "${metadata.title}" by ${metadata.uploader || metadata.channel}`
				);

				const fileName = `ampliq_yt-${videoId}.mp3`;
				const filePath = path.join(env.YT_DLP_TEMP_DIR, fileName);

				const trackId = `yt-${videoId}`;
				const trackMeta = {
					id: trackId,
					title: metadata.title,
					uploader: metadata.uploader || metadata.channel,
					duration: metadata.duration,
					thumbnail: metadata.thumbnail,
				};

				send({ phase: "found", metadata: trackMeta });

				if (fs.existsSync(filePath)) {
					console.log(`[${requestId}] File already cached: ${filePath}`);
					send({ phase: "downloading", progress: 100 });
				} else {
					console.log(`[${requestId}] Starting download to ${filePath}`);
					await downloadAudio(videoId, filePath, requestId, (progress) => {
						send({ phase: "downloading", progress });
					});
					console.log(`[${requestId}] Download complete`);
				}

				// Store metadata in DB with 30-min TTL
				try {
					const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
					await prisma.downloadedTrack.create({
						data: {
							videoId,
							title: metadata.title,
							uploader: metadata.uploader || metadata.channel || "Unknown",
							duration: metadata.duration,
							thumbnail: metadata.thumbnail,
							audioUrl: `/api/yt-dlp/file/${trackId}`,
							expiresAt,
						},
					});
					console.log(
						`[${requestId}] Saved to DB, expires at ${expiresAt.toISOString()}`
					);
				} catch (e) {
					console.error(`[${requestId}] Failed to save to DB:`, e);
				}

				send({
					phase: "done",
					audioUrl: `/api/yt-dlp/file/${trackId}`,
					metadata: trackMeta,
				});
				controller.close();
			} catch (err) {
				const message = err instanceof Error ? err.message : "Unknown error";
				console.error(`[${requestId}] Download failed:`, message);
				send({ phase: "error", message });
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
