"use client";

import type { auth } from "@ampliq/auth";
import {
	ListMusic,
	ListPlus,
	Loader2,
	Mic,
	Music,
	Pause,
	Play,
	Search,
	SkipBack,
	SkipForward,
	Trash2,
	User,
	UserCircle,
	Volume2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Waveform, type WaveformHandle } from "@/components/waveform";
import { useYtDownload } from "@/hooks/use-yt-download";
import { useYtSearch } from "@/hooks/use-yt-search";
import { type Track, usePlayerStore } from "@/store/use-player-store";
import { JamendoPanel } from "./jamendo-panel";
import { YouTubeResults } from "./youtube-results";

interface SearchResponse {
	total: number;
	tracks: Track[];
}

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEED_TO_BPM: Record<string, string> = {
	verylow: "60-80 BPM",
	low: "80-100 BPM",
	mid: "100-120 BPM",
	high: "120-150 BPM",
	veryhigh: "150-180 BPM",
};

export default function HomePage({
	session,
}: {
	session: typeof auth.$Infer.Session;
}) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<Track[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasHydrated, setHasHydrated] = useState(false);
	const [activeTab, setActiveTab] = useState<"jamendo" | "youtube">("jamendo");

	const {
		currentSong,
		queue,
		isPlaying,
		currentTime,
		volume,
		setIsPlaying,
		setCurrentTime,
		setVolume,
		addToQueue,
		removeFromQueue,
		playNow,
		playNext,
		playTrackFromQueue,
	} = usePlayerStore();

	const { downloadStates, download: downloadYt } = useYtDownload();
	const [activeDownloads, setActiveDownloads] = useState<
		{ videoId: string; track: Track }[]
	>([]);

	const fetchActiveDownloads = useCallback(async () => {
		try {
			const res = await fetch("/api/yt-dlp/active");
			const data = await res.json();
			if (data.tracks) {
				const formatted = data.tracks.map(
					(t: {
						videoId: string;
						id: string;
						title: string;
						uploader: string;
						duration: number;
						thumbnail: string;
						audioUrl: string;
					}) => ({
						videoId: t.videoId,
						track: {
							id: t.id,
							name: t.title,
							artistName: t.uploader,
							duration: t.duration,
							albumImage: t.thumbnail,
							albumName: "YouTube",
							audio: t.audioUrl,
						},
					})
				);
				setActiveDownloads(formatted);
			}
		} catch (err) {
			console.error("Failed to fetch active downloads", err);
		}
	}, []);

	useEffect(() => {
		fetchActiveDownloads();
	}, [fetchActiveDownloads]);

	const {
		results: ytResults,
		loading: ytLoading,
		search: searchYt,
	} = useYtSearch();

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	const waveformRef = useRef<WaveformHandle | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const ytDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const timeThrottleRef = useRef<number>(0);

	const handleTimeUpdate = useCallback(
		(time: number) => {
			const now = Date.now();
			if (now - timeThrottleRef.current > 200) {
				timeThrottleRef.current = now;
				setCurrentTime(time);
			}
		},
		[setCurrentTime]
	);

	const search = useCallback(async (q: string) => {
		if (q.trim().length === 0) {
			setResults([]);
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(
				`/api/jamendo/search?q=${encodeURIComponent(q.trim())}`
			);
			const data: SearchResponse = await res.json();
			setResults(Array.isArray(data.tracks) ? data.tracks : []);
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const debouncedSearch = useCallback(
		(value: string) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			debounceRef.current = setTimeout(() => search(value), 350);
		},
		[search]
	);

	const debouncedYtSearch = useCallback(
		(value: string) => {
			if (ytDebounceRef.current) {
				clearTimeout(ytDebounceRef.current);
			}
			ytDebounceRef.current = setTimeout(() => searchYt(value), 500);
		},
		[searchYt]
	);

	const playPrev = useCallback(() => {
		if (currentSong) {
			waveformRef.current?.seekTo(0);
		}
	}, [currentSong]);

	const handlePlayNow = useCallback(
		(track: Track) => {
			if (currentSong?.id === track.id) {
				waveformRef.current?.seekTo(0);
				setIsPlaying(true);
			} else {
				playNow(track);
			}
		},
		[currentSong, playNow, setIsPlaying]
	);

	const togglePlayPause = useCallback(() => {
		setIsPlaying(!isPlaying);
	}, [isPlaying, setIsPlaying]);

	const handleYtDownload = useCallback(
		async (videoId: string): Promise<Track | undefined> => {
			// Check if already in active downloads
			const existing = activeDownloads.find((d) => d.videoId === videoId);
			if (existing) {
				return existing.track;
			}

			const track = await downloadYt(videoId);
			if (track) {
				// Refresh active downloads after a new one
				fetchActiveDownloads();
				return track;
			}
			return;
		},
		[downloadYt, activeDownloads, fetchActiveDownloads]
	);

	const totalDuration = queue.reduce((acc, track) => acc + track.duration, 0);

	if (!hasHydrated) {
		return null;
	}

	return (
		<>
			<style>{`
					.glass-panel {
							background: rgba(15, 23, 42, 0.6);
							backdrop-filter: blur(20px);
							border: 1px solid rgba(255, 255, 255, 0.08);
					}
					.waveform-bar {
							background: linear-gradient(to top, #571bc1, #c0c1ff);
					}
					.pulse-ring {
							box-shadow: 0 0 0 0 rgba(192, 193, 255, 0.4);
							animation: pulse-indigo 2s infinite;
					}
					@keyframes pulse-indigo {
							0% { box-shadow: 0 0 0 0 rgba(192, 193, 255, 0.4); }
							70% { box-shadow: 0 0 0 20px rgba(192, 193, 255, 0); }
							100% { box-shadow: 0 0 0 0 rgba(192, 193, 255, 0); }
					}
					::-webkit-scrollbar { width: 4px; }
					::-webkit-scrollbar-track { background: transparent; }
					::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
				`}</style>

			{/* TopAppBar */}
			<header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-[#e4e1ed]/5 border-b bg-[#13131b]/60 px-5 backdrop-blur-xl md:px-12">
				<div className="flex items-center gap-2">
					<span className="font-extrabold text-[#c0c1ff] text-[24px] tracking-tight">
						Ampliq
					</span>
				</div>

				<div className="mx-4 flex flex-1 items-center gap-4 md:mx-8">
					{/* Single Search Bar */}
					<div className="group relative flex-1">
						<Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#c7c4d7] transition-colors group-focus-within:text-[#c0c1ff]" />
						<input
							className="w-full rounded-full border-none bg-[#1b1b23] py-2 pr-4 pl-10 text-[#e4e1ed] text-[14px] outline-none transition-all placeholder:text-[#c7c4d7]/50 focus:ring-1 focus:ring-[#c0c1ff]/50"
							onChange={(e) => {
								const val = e.target.value;
								setSearchQuery(val);
								debouncedSearch(val);
								debouncedYtSearch(val);
							}}
							placeholder="Search for music on Jamendo & YouTube..."
							type="text"
							value={searchQuery}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4 text-[#e4e1ed]">
					<div className="mr-2 hidden text-sm md:block">
						{session.user.name}
					</div>
					<button
						className="transition-colors duration-200 hover:text-[#c0c1ff] active:scale-95"
						onClick={() => router.push("/dashboard")}
						type="button"
					>
						<UserCircle className="h-7 w-7" />
					</button>
				</div>
			</header>

			{/* Main Content Layout */}
			<main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 pt-24 pb-24 text-[#e4e1ed] md:grid-cols-12 md:px-12 md:pr-[340px] md:pb-8">
				{/* Left Column: Now Playing (60%) */}
				<section className="flex flex-col gap-10 md:col-span-7">
					{/* ... same as before ... */}
					<div className="group relative">
						<div className="absolute -inset-4 rounded-full bg-[#c0c1ff]/10 opacity-20 blur-3xl" />
						<div className="glass-panel relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl shadow-[#c0c1ff]/10">
							{currentSong ? (
								<Image
									alt={currentSong.albumName}
									className="h-full w-full object-cover"
									fill
									src={currentSong.albumImage}
									unoptimized
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-[#1f1f27]">
									<Play className="h-16 w-16 text-[#34343d]" />
								</div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-[#13131b]/80 to-transparent opacity-60" />
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<div className="flex items-end justify-between">
							<div className="min-w-0 pr-4">
								<h1 className="truncate font-extrabold text-[#e4e1ed] text-[40px] leading-tight tracking-tight">
									{currentSong ? currentSong.name : "No Track Selected"}
								</h1>
								<p className="truncate text-[#c7c4d7] text-[18px]">
									{currentSong
										? currentSong.artistName
										: "Search for music to start listening"}
								</p>
							</div>
							{currentSong?.speed && (
								<span className="mb-2 shrink-0 rounded-full border border-[#c0c1ff]/20 bg-[#c0c1ff]/10 px-4 py-1.5 font-bold text-[#c0c1ff] text-[12px] uppercase tracking-wider">
									{SPEED_TO_BPM[currentSong.speed] || currentSong.speed}
								</span>
							)}
						</div>

						{/* Waveform Visualizer */}
						<div className="glass-panel relative min-h-[110px] overflow-hidden rounded-xl p-6 shadow-inner">
							{currentSong ? (
								<Waveform
									audioUrl={currentSong.audio}
									initialTime={currentTime}
									isPlaying={isPlaying}
									onFinish={playNext}
									onPlayStateChange={setIsPlaying}
									onTimeUpdate={handleTimeUpdate}
									peaks={currentSong.waveform}
									ref={waveformRef}
									volume={volume}
								/>
							) : (
								<div className="flex h-12 w-full items-center justify-between gap-1">
									{[
										20, 40, 70, 50, 90, 60, 40, 80, 50, 30, 60, 90, 40, 70, 30,
										50, 85, 60, 40, 70, 20,
									].map((h, i) => (
										<div
											className="waveform-bar w-1.5 rounded-full opacity-20"
											key={i}
											style={{ height: `${h}%` }}
										/>
									))}
								</div>
							)}
						</div>

						{/* Playback Controls */}
						<div className="flex flex-col gap-4 pt-4">
							<div className="flex items-center justify-between px-2">
								<span className="font-medium text-[#c7c4d7] text-[12px] tracking-wider">
									{formatDuration(currentTime)}
								</span>
								<div className="flex items-center gap-8">
									<button
										className="text-[#c7c4d7] transition-colors hover:text-[#c0c1ff] disabled:opacity-50"
										disabled={!currentSong}
										onClick={playPrev}
										type="button"
									>
										<SkipBack className="h-8 w-8" />
									</button>
									<button
										className="pulse-ring flex h-16 w-16 items-center justify-center rounded-full bg-[#c0c1ff] text-[#1000a9] transition-all hover:scale-105 active:scale-95"
										onClick={togglePlayPause}
										type="button"
									>
										{isPlaying ? (
											<Pause className="h-8 w-8 fill-current" />
										) : (
											<Play className="ml-1 h-8 w-8 fill-current" />
										)}
									</button>
									<button
										className="text-[#c7c4d7] transition-colors hover:text-[#c0c1ff] disabled:opacity-50"
										disabled={queue.length === 0}
										onClick={playNext}
										type="button"
									>
										<SkipForward className="h-8 w-8" />
									</button>
								</div>
								<div className="group flex cursor-pointer items-center gap-2 text-[#c7c4d7]">
									<Volume2 className="h-5 w-5" />
									<div
										aria-label="Volume"
										aria-valuemax={100}
										aria-valuemin={0}
										aria-valuenow={volume * 100}
										className="h-1.5 w-20 overflow-hidden rounded-full bg-[#34343d]"
										onClick={(e) => {
											const rect = e.currentTarget.getBoundingClientRect();
											const pos = Math.max(
												0,
												Math.min(1, (e.clientX - rect.left) / rect.width)
											);
											setVolume(pos);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												// Handle keyboard interaction
											}
										}}
										role="slider"
										tabIndex={0}
									>
										<div
											className="h-full bg-[#c0c1ff]"
											style={{ width: `${volume * 100}%` }}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Right Column: Tabbed Search Results */}
				<section className="flex max-h-[calc(100vh-160px)] flex-col gap-6 overflow-y-auto pr-2 md:col-span-5">
					{/* Tabs Header */}
					<div className="sticky top-0 z-10 flex gap-4 border-[#e4e1ed]/5 border-b bg-[#13131b]/80 backdrop-blur-md">
						<button
							className={`relative pb-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all ${
								activeTab === "jamendo"
									? "text-[#c0c1ff]"
									: "text-[#c7c4d7]/50 hover:text-[#c7c4d7]"
							}`}
							onClick={() => setActiveTab("jamendo")}
							type="button"
						>
							Jamendo
							{activeTab === "jamendo" && (
								<div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#c0c1ff]" />
							)}
						</button>
						<button
							className={`relative pb-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all ${
								activeTab === "youtube"
									? "text-[#ff4444]"
									: "text-[#c7c4d7]/50 hover:text-[#c7c4d7]"
							}`}
							onClick={() => setActiveTab("youtube")}
							type="button"
						>
							YouTube
							{activeTab === "youtube" && (
								<div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#ff4444]" />
							)}
						</button>
					</div>

					<div className="flex flex-col gap-4">
						{activeTab === "jamendo" ? (
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-[#c0c1ff] text-[10px] uppercase tracking-widest opacity-50">
										Jamendo Results
									</h3>
									{loading && (
										<Loader2 className="h-4 w-4 animate-spin text-[#c0c1ff]" />
									)}
								</div>
								<JamendoPanel
									addToQueue={addToQueue}
									handlePlayNow={handlePlayNow}
									loading={loading}
									query={searchQuery}
									results={results}
								/>
							</div>
						) : (
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-[#ff4444] text-[10px] uppercase tracking-widest opacity-50">
										YouTube Results
									</h3>
									{ytLoading && (
										<Loader2 className="h-4 w-4 animate-spin text-[#ff4444]" />
									)}
								</div>

								{/* Recent Downloads Section */}
								{activeDownloads.length > 0 && (
									<div className="flex flex-col gap-3">
										<h4 className="font-bold text-[#c0c1ff] text-[10px] uppercase tracking-widest opacity-80">
											Recent Downloads
										</h4>
										<div className="flex flex-col gap-2">
											{activeDownloads.slice(0, 5).map(({ videoId, track }) => (
												<div
													className="group flex items-center gap-3 rounded-lg bg-[#c0c1ff]/5 p-2 transition-all hover:bg-[#c0c1ff]/10"
													key={videoId}
												>
													<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#1f1f27]">
														{track.albumImage ? (
															<Image
																alt={track.name}
																className="object-cover"
																fill
																src={track.albumImage}
																unoptimized
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center">
																<Play className="h-4 w-4 text-[#c7c4d7]" />
															</div>
														)}
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate font-medium text-[#e4e1ed] text-sm">
															{track.name}
														</p>
														<p className="truncate text-[#c7c4d7] text-[10px]">
															{track.artistName}
														</p>
													</div>
													<div className="flex gap-2 opacity-0 transition-all group-hover:opacity-100">
														<button
															className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#34343d] text-[#c7c4d7] transition-all hover:bg-[#c0c1ff] hover:text-[#1000a9]"
															onClick={() => addToQueue(track)}
															type="button"
														>
															<ListPlus className="h-4 w-4" />
														</button>
														<button
															className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c0c1ff] text-[#1000a9] transition-all hover:scale-105"
															onClick={() => handlePlayNow(track)}
															type="button"
														>
															<Play className="h-4 w-4 fill-current" />
														</button>
													</div>
												</div>
											))}
										</div>
										<div className="h-px w-full bg-[#e4e1ed]/5" />
									</div>
								)}

								{/* Search Results */}
								{searchQuery && (
									<div className="flex flex-col gap-4">
										<YouTubeResults
											activeDownloads={activeDownloads.map((d) => d.videoId)}
											downloadStates={downloadStates}
											onAddToQueue={addToQueue}
											onDownload={handleYtDownload}
											onPlayNow={handlePlayNow}
											results={ytResults}
										/>
									</div>
								)}

								{!searchQuery && activeDownloads.length === 0 && (
									<div className="flex flex-col items-center justify-center py-12 text-[#c7c4d7] opacity-50">
										<Music className="mb-4 h-12 w-12" />
										<p>Search YouTube to see results here</p>
									</div>
								)}
							</div>
						)}
					</div>
				</section>
			</main>

			{/* Sidebar (Right): Up Next Queue */}
			{/* ... same as before ... */}
			<aside className="fixed top-16 right-0 bottom-0 z-40 hidden w-80 flex-col border-[#e4e1ed]/5 border-l bg-[#1b1b23]/80 text-[#e4e1ed] shadow-xl backdrop-blur-2xl md:flex">
				<div className="flex items-center justify-between border-[#e4e1ed]/5 border-b p-6">
					<div>
						<h4 className="font-semibold text-[#c0c1ff] text-[20px]">
							Up Next
						</h4>
						<p className="mt-1 font-medium text-[#c7c4d7] text-[10px] uppercase tracking-widest">
							Queue Sidebar
						</p>
					</div>
					<button
						className="rounded-full p-2 text-[#c0c1ff] transition-colors hover:bg-[#c0c1ff]/10"
						type="button"
					>
						<ListPlus className="h-6 w-6" />
					</button>
				</div>
				<div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
					{queue.length > 0 ? (
						queue.map((track, idx) => (
							<div
								className="group flex w-full items-center gap-2 rounded-xl p-2 transition-all duration-200 hover:bg-[#34343d]/40"
								key={`${track.id}-${idx}`}
							>
								<button
									className="flex flex-1 cursor-pointer items-center gap-4 text-left outline-none"
									onClick={() => playTrackFromQueue(idx)}
									type="button"
								>
									<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1f1f27]">
										{track.albumImage ? (
											<Image
												alt={track.albumName}
												className="h-full w-full object-cover"
												fill
												src={track.albumImage}
												unoptimized
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<Play className="h-4 w-4 text-[#c7c4d7]" />
											</div>
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-[#e4e1ed] text-[16px]">
											{track.name}
										</p>
										<p className="truncate font-medium text-[#c7c4d7] text-[11px]">
											{track.artistName}
										</p>
									</div>
								</button>
								<button
									className="shrink-0 p-1 text-[#ffb4ab] opacity-0 transition-all hover:text-[#ffb4ab]/80 group-hover:opacity-100"
									onClick={() => removeFromQueue(idx)}
									type="button"
								>
									<Trash2 className="h-5 w-5" />
								</button>
							</div>
						))
					) : (
						<div className="flex h-full flex-col items-center justify-center space-y-4 text-[#c7c4d7] opacity-50">
							<ListMusic className="h-12 w-12" />
							<p className="text-sm">Queue is empty</p>
						</div>
					)}
				</div>
				<div className="border-[#e4e1ed]/5 border-t bg-[#1f1f27]/50 p-6">
					<div className="flex items-center justify-between">
						<span className="font-bold text-[#c7c4d7] text-[11px] uppercase tracking-[0.1em]">
							Total Duration
						</span>
						<span className="font-medium text-[#e4e1ed] text-[16px]">
							{formatDuration(totalDuration)}
						</span>
					</div>
					<button
						className="mt-4 w-full rounded-xl bg-[#571bc1] py-3 font-bold text-[#c4abff] text-[11px] uppercase tracking-[0.1em] transition-all hover:brightness-110 active:scale-[0.98]"
						type="button"
					>
						Mix Now
					</button>
				</div>
			</aside>

			{/* BottomNavBar (Mobile Only) */}
			<nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-[#e4e1ed]/10 border-t bg-[#13131b]/90 px-4 pb-safe shadow-2xl shadow-[#c0c1ff]/20 backdrop-blur-lg md:hidden">
				<button
					className="flex scale-105 animate-pulse flex-col items-center justify-center rounded-full bg-[#8083ff] p-2 text-[#0d0096]"
					type="button"
				>
					<Mic className="h-6 w-6" />
					<span className="mt-1 font-bold text-[11px] tracking-[0.1em]">
						Listen
					</span>
				</button>
				<button
					className="flex flex-col items-center justify-center p-2 text-[#c7c4d7] transition-colors hover:bg-[#34343d]/30"
					type="button"
				>
					<Search className="h-6 w-6" />
					<span className="mt-1 font-bold text-[11px] tracking-[0.1em]">
						Search
					</span>
				</button>
				<button
					className="flex flex-col items-center justify-center p-2 text-[#c7c4d7] transition-colors hover:bg-[#34343d]/30"
					type="button"
				>
					<ListMusic className="h-6 w-6" />
					<span className="mt-1 font-bold text-[11px] tracking-[0.1em]">
						Queue
					</span>
				</button>
				<button
					className="flex flex-col items-center justify-center p-2 text-[#c7c4d7] transition-colors hover:bg-[#34343d]/30"
					onClick={() => router.push("/dashboard")}
					type="button"
				>
					<User className="h-6 w-6" />
					<span className="mt-1 font-bold text-[11px] tracking-[0.1em]">
						Profile
					</span>
				</button>
			</nav>
		</>
	);
}
