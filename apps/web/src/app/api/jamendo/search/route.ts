import { env } from "@ampliq/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface JamendoTrack {
	album_id: string;
	album_image: string;
	album_name: string;
	artist_id: string;
	artist_name: string;
	audio: string;
	audiodownload: string;
	audiodownload_allowed: boolean;
	duration: number;
	id: string;
	image: string;
	license_ccurl: string;
	musicinfo?: {
		speed?: "low" | "mid" | "high" | "verylow" | "veryhigh";
	};
	name: string;
	releasedate: string;
	waveform?: string;
}

interface JamendoResponse {
	headers: {
		status: string;
		code: number;
		results_count: number;
		results_fullcount?: number;
	};
	results: JamendoTrack[];
}

const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const query = searchParams.get("q");
	const offset = searchParams.get("offset") || "0";
	const limit = searchParams.get("limit") || "20";

	if (!query || query.trim().length === 0) {
		return NextResponse.json({ tracks: [], total: 0 });
	}

	const params = new URLSearchParams({
		client_id: env.JAMENDO_CLIENT_ID,
		format: "json",
		namesearch: query.trim(),
		limit: String(Math.min(Number(limit), 200)),
		offset,
		include: "musicinfo",
		imagesize: "200",
		audioformat: "mp32",
	});

	const url = `${JAMENDO_API_BASE}/tracks/?${params.toString()}`;

	try {
		const response = await fetch(url);
		const data: JamendoResponse = await response.json();

		if (data.headers.status !== "success") {
			return NextResponse.json({ error: "Jamendo API error" }, { status: 502 });
		}

		const tracks = data.results.map((track) => ({
			id: track.id,
			name: track.name,
			duration: track.duration,
			artistName: track.artist_name,
			artistId: track.artist_id,
			albumName: track.album_name,
			albumId: track.album_id,
			albumImage: track.album_image || track.image,
			audio: track.audio,
			audioDownload: track.audiodownload,
			audioDownloadAllowed: track.audiodownload_allowed,
			releaseDate: track.releasedate,
			licenseUrl: track.license_ccurl,
			speed: track.musicinfo?.speed,
			waveform: track.waveform,
		}));

		return NextResponse.json({
			tracks,
			total: data.headers.results_fullcount ?? data.headers.results_count,
		});
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch from Jamendo API" },
			{ status: 502 }
		);
	}
}
