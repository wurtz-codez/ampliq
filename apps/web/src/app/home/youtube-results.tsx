"use client";

import {
	AlertCircle,
	Download,
	ListPlus,
	Loader2,
	Music,
	Play,
} from "lucide-react";
import Image from "next/image";
import type { DownloadState } from "@/hooks/use-yt-download";
import type { YouTubeSearchResult } from "@/hooks/use-yt-search";
import type { Track } from "@/store/use-player-store";

interface YouTubeResultsProps {
	activeDownloads?: string[];
	downloadStates: Record<string, DownloadState>;
	onAddToQueue: (track: Track) => void;
	onDownload: (videoId: string) => Promise<Track | undefined>;
	onPlayNow: (track: Track) => void;
	results: YouTubeSearchResult[];
}

export function YouTubeResults({
	results,
	downloadStates,
	onDownload,
	onPlayNow,
	onAddToQueue,
	activeDownloads = [],
}: YouTubeResultsProps) {
	if (results.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-[#c7c4d7] opacity-50">
				<Music className="mb-4 h-12 w-12" />
				<p>Search YouTube to see results here</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 overflow-y-auto pr-2">
			{results.map((result) => {
				const state = downloadStates[result.id] || {
					phase: "idle",
					progress: 0,
					error: null,
					track: null,
				};

				const isDownloading =
					state.phase === "searching" ||
					state.phase === "downloading" ||
					state.phase === "found";
				const isDone = state.phase === "done" && !!state.track;
				const isError = state.phase === "error";
				const isAlreadyDownloaded = activeDownloads.includes(result.id);

				return (
					<div
						className={`group relative flex items-center gap-4 rounded-xl p-3 transition-all ${
							isAlreadyDownloaded
								? "border border-[#c0c1ff]/20 bg-[#c0c1ff]/10"
								: "bg-[#1b1b23]/40"
						} hover:bg-[#34343d]/40`}
						key={result.id}
					>
						<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#1f1f27]">
							{result.thumbnail ? (
								<Image
									alt={result.title}
									className="object-cover"
									fill
									src={result.thumbnail}
									unoptimized
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center">
									<Music className="h-6 w-6 text-[#c7c4d7]" />
								</div>
							)}
							{isDownloading && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
									<Loader2 className="h-6 w-6 animate-spin text-[#c0c1ff]" />
								</div>
							)}
							{isAlreadyDownloaded && !isDownloading && !isDone && (
								<div className="absolute inset-0 flex items-center justify-center bg-[#c0c1ff]/20 backdrop-blur-[1px]">
									<Play className="h-6 w-6 text-[#c0c1ff]" />
								</div>
							)}
						</div>

						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<h4 className="truncate font-semibold text-[#e4e1ed] text-[15px]">
									{result.title}
								</h4>
								{isAlreadyDownloaded && (
									<span className="shrink-0 rounded-full bg-[#c0c1ff]/20 px-1.5 py-0.5 font-bold text-[#c0c1ff] text-[9px] uppercase tracking-wider">
										Cached
									</span>
								)}
							</div>
							<p className="truncate text-[#c7c4d7] text-[12px]">
								{result.uploader}
							</p>

							{isDownloading && (
								<div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#34343d]">
									<div
										className="h-full bg-[#c0c1ff] transition-all duration-300"
										style={{ width: `${state.progress}%` }}
									/>
								</div>
							)}

							{isError && (
								<div className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
									<AlertCircle className="h-3 w-3" />
									<span className="truncate">{state.error}</span>
								</div>
							)}
						</div>

						<div className="flex shrink-0 items-center gap-2">
							{isDone || (isAlreadyDownloaded && !isDownloading) ? (
								<>
									<button
										className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34343d] text-[#c7c4d7] transition-all hover:bg-[#c0c1ff] hover:text-[#1000a9] active:scale-95"
										onClick={() => {
											if (isDone && state.track) {
												onAddToQueue(state.track);
											} else if (isAlreadyDownloaded) {
												onDownload(result.id).then((t) => t && onAddToQueue(t));
											}
										}}
										title="Add to Queue"
										type="button"
									>
										<ListPlus className="h-5 w-5" />
									</button>
									<button
										className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c0c1ff] text-[#1000a9] transition-all hover:scale-105 active:scale-95"
										onClick={() => {
											if (isDone && state.track) {
												onPlayNow(state.track);
											} else if (isAlreadyDownloaded) {
												onDownload(result.id).then((t) => t && onPlayNow(t));
											}
										}}
										title="Play Now"
										type="button"
									>
										<Play className="h-5 w-5 fill-current" />
									</button>
								</>
							) : (
								<button
									className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34343d] text-[#c7c4d7] transition-all hover:bg-[#c0c1ff] hover:text-[#1000a9] disabled:opacity-50"
									disabled={isDownloading}
									onClick={() => onDownload(result.id)}
									type="button"
								>
									{isDownloading ? (
										<span className="font-bold text-[10px]">
											{Math.round(state.progress)}%
										</span>
									) : (
										<Download className="h-5 w-5" />
									)}
								</button>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
