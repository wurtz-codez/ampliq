import { useCallback, useState } from "react";
import type { Track } from "@/store/use-player-store";

export type DownloadPhase =
	| "idle"
	| "searching"
	| "found"
	| "downloading"
	| "done"
	| "error";

export interface DownloadState {
	error: string | null;
	phase: DownloadPhase;
	progress: number;
	track: Track | null;
}

interface SseData {
	audioUrl?: string;
	message?: string;
	metadata?: {
		duration: number;
		id: string;
		thumbnail: string;
		title: string;
		uploader: string;
	};
	phase: DownloadPhase;
	progress?: number;
}

const DOWNLOAD_TIMEOUT_MS = 45_000;

function createTrackFromMetadata(data: SseData): Track | undefined {
	const meta = data.metadata;
	const audioUrl = data.audioUrl;
	if (!(meta && audioUrl)) {
		return;
	}
	return {
		id: meta.id,
		name: meta.title,
		artistName: meta.uploader,
		duration: meta.duration,
		albumImage: meta.thumbnail,
		audio: audioUrl,
		albumName: "YouTube",
		artistId: "youtube",
		albumId: "youtube",
		audioDownload: "",
		audioDownloadAllowed: false,
		releaseDate: new Date().toISOString(),
		licenseUrl: "https://www.youtube.com/static?template=terms",
	};
}

function processSseLine(
	line: string,
	onPhase: (phase: DownloadPhase, data: SseData) => void
): Track | undefined {
	if (!line.startsWith("data: ")) {
		return;
	}

	let data: SseData;
	try {
		data = JSON.parse(line.slice(6)) as SseData;
	} catch {
		return;
	}

	const phase = data.phase;

	if (phase === "done") {
		const track = createTrackFromMetadata(data);
		if (track) {
			onPhase("done", { ...data, progress: 100 });
			return track;
		}
		return;
	}

	onPhase(phase, data);
}

async function readSseStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	onPhase: (phase: DownloadPhase, data: SseData) => void
): Promise<Track | undefined> {
	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			return;
		}

		const chunk = decoder.decode(value);
		const lines = chunk.split("\n");

		for (const line of lines) {
			const result = processSseLine(line, onPhase);
			if (result) {
				return result;
			}
		}
	}
}

export function useYtDownload() {
	const [downloadStates, setDownloadStates] = useState<
		Record<string, DownloadState>
	>({});

	const updateState = useCallback(
		(videoId: string, newState: Partial<DownloadState>) => {
			setDownloadStates((prev) => ({
				...prev,
				[videoId]: {
					...(prev[videoId] || {
						phase: "idle",
						progress: 0,
						error: null,
						track: null,
					}),
					...newState,
				},
			}));
		},
		[]
	);

	const download = useCallback(
		async (videoId: string): Promise<Track | undefined> => {
			if (!videoId.trim()) {
				return;
			}

			updateState(videoId, {
				phase: "searching",
				progress: 0,
				error: null,
				track: null,
			});

			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(new Error("Download timed out")),
				DOWNLOAD_TIMEOUT_MS
			);

			try {
				const response = await fetch("/api/yt-dlp/download", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ videoId }),
					signal: controller.signal,
				});

				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					throw new Error(
						(body as { error?: string }).error ?? "Download request failed"
					);
				}

				if (!response.body) {
					throw new Error("No response body");
				}

				const onPhase = (phase: DownloadPhase, data: SseData) => {
					if (phase === "error") {
						updateState(videoId, {
							phase: "error",
							error: data.message ?? "Unknown error",
						});
						return;
					}

					if (phase === "found" || phase === "searching") {
						updateState(videoId, { phase });
						return;
					}

					updateState(videoId, {
						phase,
						progress: data.progress ?? 0,
					});
				};

				const track = await readSseStream(response.body.getReader(), onPhase);
				return track;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to download";
				updateState(videoId, { phase: "error", error: message });
			} finally {
				clearTimeout(timeoutId);
			}
		},
		[updateState]
	);

	const reset = useCallback((videoId: string) => {
		setDownloadStates((prev) => {
			const next = { ...prev };
			delete next[videoId];
			return next;
		});
	}, []);

	return { downloadStates, download, reset };
}
