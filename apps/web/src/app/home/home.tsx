"use client";

import type { auth } from "@ampliq/auth";
import {
	ListMusic,
	ListPlus,
	Mic,
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
import { type Track, usePlayerStore } from "@/store/use-player-store";

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
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Track[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasHydrated, setHasHydrated] = useState(false);

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

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	const waveformRef = useRef<WaveformHandle | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	const totalDuration = queue.reduce((acc, track) => acc + track.duration, 0);

	if (!hasHydrated) {
		return null; // Or a loading skeleton
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
				<div className="mx-8 hidden max-w-xl flex-1 md:flex">
					<div className="group relative w-full">
						<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#c7c4d7] transition-colors group-focus-within:text-[#c0c1ff]" />
						<input
							className="w-full rounded-full border-none bg-[#1b1b23] py-2.5 pr-4 pl-12 text-[#e4e1ed] text-[16px] outline-none transition-all placeholder:text-[#c7c4d7]/50 focus:ring-1 focus:ring-[#c0c1ff]/50"
							onChange={(e) => {
								setQuery(e.target.value);
								debouncedSearch(e.target.value);
							}}
							placeholder="Search artists, tracks, moods..."
							type="text"
							value={query}
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
									onTimeUpdate={setCurrentTime}
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
												// Handle keyboard interaction if needed
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

				{/* Right Column: Hum/Mix or Search Results */}
				<section className="flex h-full flex-col gap-10 md:col-span-5">
					{query.trim().length > 0 || results.length > 0 ? (
						<div className="glass-panel flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl border-[#c0c1ff]/10 p-6 shadow-[#c0c1ff]/5 shadow-lg">
							<h2 className="font-bold text-[#c7c4d7] text-[11px] uppercase tracking-[0.2em]">
								Search Results {loading && "..."}
							</h2>
							<div className="flex-1 space-y-2 overflow-y-auto pr-2">
								{results?.map((track) => (
									<div
										className="group flex items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-[#34343d]/40"
										key={track.id}
									>
										<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#1f1f27]">
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
													<Play className="h-5 w-5 text-[#c7c4d7]" />
												</div>
											)}
										</div>
										<div className="flex min-w-0 flex-1 flex-col justify-center">
											<p className="truncate font-medium text-[#e4e1ed] text-[16px]">
												{track.name}
											</p>
											<p className="truncate text-[#c7c4d7] text-[12px]">
												{track.artistName}
											</p>
										</div>
										<div className="flex shrink-0 gap-2">
											<button
												className="h-8 rounded-lg bg-[#c0c1ff] px-3 font-bold text-[#1000a9] text-[11px] transition-all hover:brightness-110 active:scale-95"
												onClick={() => handlePlayNow(track)}
												type="button"
											>
												Play
											</button>
											<button
												className="h-8 rounded-lg border border-[#464554] px-3 font-bold text-[#c7c4d7] text-[11px] transition-all hover:border-[#c0c1ff]/30 hover:bg-[#c0c1ff]/10 hover:text-[#c0c1ff] active:scale-95"
												onClick={() => addToQueue(track)}
												type="button"
											>
												+ Queue
											</button>
										</div>
									</div>
								))}
								{results.length === 0 && !loading && (
									<p className="mt-10 text-center text-[#c7c4d7]">
										No tracks found.
									</p>
								)}
							</div>
						</div>
					) : (
						<>
							{/* Hum Activation Hero */}
							<div className="glass-panel flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border-[#c0c1ff]/5 p-10 text-center">
								<h2 className="font-bold text-[#c7c4d7] text-[11px] uppercase tracking-[0.2em]">
									Hum Discovery
								</h2>
								<div className="relative">
									<button
										className="pulse-ring relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-[#c0c1ff] text-[#1000a9] transition-all hover:scale-110 active:scale-90"
										type="button"
									>
										<Mic className="h-12 w-12 fill-current" />
									</button>
									<div className="absolute inset-0 -z-10 scale-150 rounded-full bg-[#c0c1ff]/20 blur-2xl" />
								</div>
								<div>
									<p className="font-semibold text-[#e4e1ed] text-[24px]">
										Tap to Hum
									</p>
									<p className="mx-auto mt-2 max-w-xs text-[#c7c4d7] text-[16px]">
										Let Ampliq identify that melody stuck in your head using AI
										frequency mapping.
									</p>
								</div>
							</div>

							{/* Found State Song Card Mockup */}
							<div className="glass-panel rounded-2xl border-[#c0c1ff]/20 p-6 shadow-[#c0c1ff]/5 shadow-lg">
								<div className="flex gap-4">
									<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#1f1f27]">
										<Image
											alt="Found Cover"
											className="h-full w-full object-cover"
											fill
											src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzkyF6tTSVgAoTFQq4Q1dv1jCtJSngjxv-eI55PBeHyVoMcTTgYB2fG88qG9nVD4EeAKA5h7GHM8CA8Gxe9-iLFLO0gNVeEa5V3Ox1rgfOQWKqfXehUyGou-Aopphb0jeo08TpSjriPqeI4TLt60P_-Ipr5CppmCZ2UHKTqZT0V142TD-hXrOQnqDLvBiHo1vnD5VaexzcSByxh2exv9QF4PRwmtrItvpGiciqoh5g1I2E98kpqo7O66Pzbsbg2-v3vpvL8pJvzh35"
											unoptimized
										/>
									</div>
									<div className="flex min-w-0 flex-1 flex-col justify-center">
										<div className="flex items-start justify-between">
											<h3 className="truncate pr-2 font-semibold text-[#e4e1ed] text-[18px]">
												Synthetic Dreams
											</h3>
											<span className="shrink-0 rounded border border-[#c0c1ff]/20 bg-[#c0c1ff]/10 px-2 py-0.5 font-medium text-[#c0c1ff] text-[10px]">
												128 BPM
											</span>
										</div>
										<p className="truncate text-[#c7c4d7] text-[16px]">
											Cyberheart
										</p>
										<div className="mt-4 flex gap-3">
											<button
												className="h-10 flex-1 rounded-lg bg-[#c0c1ff] font-bold text-[#1000a9] text-[11px] transition-all hover:brightness-110 active:scale-95"
												type="button"
											>
												Mix Now
											</button>
											<button
												className="h-10 flex-1 rounded-lg border border-[#464554] font-bold text-[#c7c4d7] text-[11px] transition-all hover:bg-[#34343d]/50 active:scale-95"
												type="button"
											>
												Add to Queue
											</button>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</section>
			</main>

			{/* Sidebar (Right): Up Next Queue */}
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
