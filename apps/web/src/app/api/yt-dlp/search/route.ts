import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface YouTubeSearchResult {
	channel?: string;
	duration: number;
	id: string;
	thumbnail?: string;
	thumbnails?: { url: string }[];
	title: string;
	uploader?: string;
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q");

	if (!query) {
		return Response.json({ error: "Query is required" }, { status: 400 });
	}

	try {
		const results = await new Promise<YouTubeSearchResult[]>(
			(resolve, reject) => {
				let yt: ChildProcess | undefined;

				try {
					yt = spawn("yt-dlp", [
						"--dump-json",
						"--no-playlist",
						"--flat-playlist",
						`ytsearch5:${query}`,
					]);
				} catch (e) {
					reject(e);
					return;
				}

				if (!yt) {
					reject(new Error("Failed to spawn yt-dlp"));
					return;
				}

				let output = "";
				let errorOutput = "";

				yt.stdout?.on("data", (data) => {
					output += data.toString();
				});

				yt.stderr?.on("data", (data) => {
					errorOutput += data.toString();
				});

				yt.on("error", (err) => {
					reject(err);
				});

				yt.on("close", (code) => {
					if (code !== 0 && code !== null) {
						reject(new Error(`yt-dlp search failed: ${errorOutput}`));
						return;
					}

					try {
						const lines = output.trim().split("\n");
						const items = lines
							.map((line) => {
								if (!line) {
									return null;
								}
								try {
									return JSON.parse(line) as YouTubeSearchResult;
								} catch {
									return null;
								}
							})
							.filter((item): item is YouTubeSearchResult => item !== null);
						resolve(items);
					} catch (e) {
						reject(e);
					}
				});
			}
		);

		const formattedResults = results.map((item) => ({
			id: item.id,
			title: item.title,
			uploader: item.uploader || item.channel || "Unknown",
			duration: item.duration,
			thumbnail: item.thumbnail || item.thumbnails?.[0]?.url || "",
			url: `https://www.youtube.com/watch?v=${item.id}`,
		}));

		return Response.json({ results: formattedResults });
	} catch (error) {
		return Response.json(
			{
				error: error instanceof Error ? error.message : "Search failed",
			},
			{ status: 500 }
		);
	}
}
