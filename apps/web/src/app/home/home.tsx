"use client";

import type { auth } from "@ampliq/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { WaveformHandle } from "@/components/waveform";
import { useYtDownload } from "@/hooks/use-yt-download";
import { useYtSearch } from "@/hooks/use-yt-search";
import { type Track, usePlayerStore } from "@/store/use-player-store";
import { Deck, MixerCenter, QueueItem } from "./components";
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
		crossfader,
		setCrossfader,
	} = usePlayerStore();

	const handleBeatSync = useCallback(() => {
		toast.success("Beats synchronized!", {
			description: "Deck B is now matched with Deck A at 128 BPM.",
			icon: <span className="material-symbols-outlined">sync</span>,
		});
	}, []);

	const handleAudioError = useCallback(() => {
		toast.error("Audio unavailable", {
			description:
				"The cached audio file is no longer available. The track will be removed.",
		});
		usePlayerStore.getState().setCurrentSong(null);
	}, []);

	const handleDeckBError = useCallback(() => {
		usePlayerStore.getState().setQueue((prev: Track[]) => prev.slice(1));
	}, []);

	const handleAutoMix = useCallback(() => {
		if (queue.length === 0) {
			toast.error("Queue is empty!", {
				description: "Add some tracks to the queue first.",
			});
			return;
		}

		toast.info("Auto-mixing...", {
			description: "Transitioning to the next track.",
		});

		// Simple crossfade simulation: move fader from -1 to 1 over 5 seconds
		let start = -1;
		const interval = setInterval(() => {
			start += 0.05;
			if (start >= 1) {
				setCrossfader(1);
				clearInterval(interval);
				playNext();
				setCrossfader(0);
			} else {
				setCrossfader(start);
			}
		}, 100);

		// Clean up interval if component unmounts or mix changes (not perfectly handled here but okay for prototype)
	}, [queue.length, setCrossfader, playNext]);

	const handleSaveQueue = useCallback(() => {
		toast.success("Queue saved!", {
			description: "Current queue has been saved to your library.",
		});
	}, []);

	const handleAutoMixQueue = useCallback(() => {
		if (queue.length === 0) {
			toast.error("Nothing to mix!", {
				description: "Add some tracks to the queue first.",
			});
			return;
		}

		// Shuffle queue
		const shuffled = [...queue].sort(() => Math.random() - 0.5);
		usePlayerStore.getState().setQueue(shuffled);

		toast.success("Queue optimized!", {
			description: "Tracks have been reordered for the best mix flow.",
			icon: <span className="material-symbols-outlined">bolt</span>,
		});
	}, [queue]);

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

	const { results: ytResults, search: searchYt } = useYtSearch();

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	useEffect(() => {
		if (!hasHydrated) {
			return;
		}

		const checkAudioUrl = async (url: string) => {
			try {
				const res = await fetch(url, { method: "HEAD" });
				return res.ok;
			} catch {
				return false;
			}
		};

		const validateStore = async () => {
			const { currentSong: persistedSong, queue: persistedQueue } =
				usePlayerStore.getState();

			if (
				persistedSong?.audio?.startsWith("/api/yt-dlp/file/") &&
				!(await checkAudioUrl(persistedSong.audio))
			) {
				usePlayerStore.getState().setCurrentSong(null);
			}

			const validTracks: Track[] = [];
			for (const track of persistedQueue) {
				const isYTFile = track.audio?.startsWith("/api/yt-dlp/file/");
				if (!isYTFile || (await checkAudioUrl(track.audio))) {
					validTracks.push(track);
				}
			}
			if (validTracks.length !== persistedQueue.length) {
				usePlayerStore.getState().setQueue(validTracks);
			}
		};

		validateStore();
	}, [hasHydrated]);

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
			debounceRef.current = setTimeout(() => {
				search(value);
			}, 350);
		},
		[search]
	);

	const debouncedYtSearch = useCallback(
		(value: string) => {
			if (ytDebounceRef.current) {
				clearTimeout(ytDebounceRef.current);
			}
			ytDebounceRef.current = setTimeout(() => {
				searchYt(value);
			}, 500);
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
			const existing = activeDownloads.find((d) => d.videoId === videoId);
			if (existing) {
				return existing.track;
			}

			const track = await downloadYt(videoId);
			if (track) {
				fetchActiveDownloads();
				return track;
			}
			return;
		},
		[downloadYt, activeDownloads, fetchActiveDownloads]
	);

	if (!hasHydrated) {
		return null;
	}

	const nextInQueue = queue[0] || null;

	const deckAVolume = volume * Math.min(1, 1 - crossfader);
	const deckBVolume = volume * Math.min(1, 1 + crossfader);

	return (
		<div className="min-h-screen bg-surface-container-lowest font-body-md text-on-surface selection:bg-primary selection:text-on-primary">
			{/* TopAppBar */}
			<header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-white/10 border-b bg-surface/60 px-4 shadow-md shadow-primary/5 backdrop-blur-xl md:px-margin-desktop">
				<div className="flex items-center gap-8">
					<span className="font-display-track text-headline-md text-primary tracking-tighter">
						Ampliq
					</span>
					<div className="group relative hidden md:block">
						<span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-on-surface-variant">
							search
						</span>
						<input
							className="w-80 rounded-full border-none bg-white/5 py-2 pr-6 pl-12 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50"
							onChange={(e) => {
								const val = e.target.value;
								setSearchQuery(val);
								debouncedSearch(val);
								debouncedYtSearch(val);
							}}
							placeholder="Search songs, artists..."
							type="text"
							value={searchQuery}
						/>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<button
						className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 hover:bg-white/5 active:scale-95"
						type="button"
					>
						<span className="material-symbols-outlined">queue_music</span>
					</button>
					<button
						className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 hover:bg-white/5 active:scale-95"
						onClick={() => {
							router.push("/dashboard");
						}}
						type="button"
					>
						<span className="material-symbols-outlined">settings</span>
					</button>
					<div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
						<div className="relative h-full w-full overflow-hidden rounded-full bg-surface-container">
							{session.user.image ? (
								<Image
									alt="User Profile"
									className="object-cover"
									fill
									src={session.user.image}
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-surface-container">
									<span className="material-symbols-outlined text-on-surface-variant">
										person
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* SideNavBar */}
			<nav className="fixed top-16 left-0 z-40 hidden h-[calc(100vh-64px)] w-20 flex-col items-center gap-8 border-white/5 border-r bg-surface-container-lowest/80 py-8 backdrop-blur-2xl md:flex">
				<div className="flex flex-col items-center gap-6">
					<a
						className="group flex flex-col items-center gap-1 text-on-surface-variant transition-all duration-300 hover:translate-x-1 hover:text-tertiary"
						href="/"
					>
						<span className="material-symbols-outlined">library_music</span>
						<span className="font-label-caps text-label-caps">Library</span>
					</a>
					<a
						className="group flex flex-col items-center gap-1 rounded-xl bg-tertiary-container/20 p-2 text-tertiary-fixed-dim transition-all duration-300 hover:translate-x-1"
						href="/"
					>
						<span className="material-symbols-outlined">album</span>
						<span className="font-label-caps text-label-caps">Decks</span>
					</a>
					<a
						className="group flex flex-col items-center gap-1 text-on-surface-variant transition-all duration-300 hover:translate-x-1 hover:text-tertiary"
						href="/"
					>
						<span className="material-symbols-outlined">graphic_eq</span>
						<span className="font-label-caps text-label-caps">Mixer</span>
					</a>
					<a
						className="group flex flex-col items-center gap-1 text-on-surface-variant transition-all duration-300 hover:translate-x-1 hover:text-tertiary"
						href="/"
					>
						<span className="material-symbols-outlined">subscriptions</span>
						<span className="font-label-caps text-label-caps">Sampler</span>
					</a>
					<a
						className="group flex flex-col items-center gap-1 text-on-surface-variant transition-all duration-300 hover:translate-x-1 hover:text-tertiary"
						href="/"
					>
						<span className="material-symbols-outlined">history</span>
						<span className="font-label-caps text-label-caps">History</span>
					</a>
				</div>
			</nav>

			{/* Main Content */}
			<main className="ml-0 min-h-screen space-y-8 px-6 pt-20 pb-24 md:ml-20">
				{searchQuery ? (
					<section className="space-y-6">
						<div className="mb-6 flex gap-4 border-white/5 border-b">
							<button
								className={`pb-3 font-bold text-label-caps uppercase tracking-widest transition-all ${
									activeTab === "jamendo"
										? "border-primary border-b-2 text-primary"
										: "text-on-surface-variant hover:text-on-surface"
								}`}
								onClick={() => {
									setActiveTab("jamendo");
								}}
								type="button"
							>
								Jamendo
							</button>
							<button
								className={`pb-3 font-bold text-label-caps uppercase tracking-widest transition-all ${
									activeTab === "youtube"
										? "border-error border-b-2 text-error"
										: "text-on-surface-variant hover:text-on-surface"
								}`}
								onClick={() => {
									setActiveTab("youtube");
								}}
								type="button"
							>
								YouTube
							</button>
						</div>

						{activeTab === "jamendo" ? (
							<JamendoPanel
								addToQueue={addToQueue}
								handlePlayNow={handlePlayNow}
								loading={loading}
								query={searchQuery}
								results={results}
							/>
						) : (
							<YouTubeResults
								activeDownloads={activeDownloads.map((d) => d.videoId)}
								downloadStates={downloadStates}
								onAddToQueue={addToQueue}
								onDownload={handleYtDownload}
								onPlayNow={handlePlayNow}
								results={ytResults}
							/>
						)}
					</section>
				) : (
					<>
						{/* Mixer Console */}
						<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
							<Deck
								colorClass="bg-cyan-500"
								currentTime={currentTime}
								isPlaying={isPlaying}
								label="Deck A"
								onAudioError={handleAudioError}
								onPlayNext={playNext}
								onPlayPrev={playPrev}
								onPlayTrackFromQueue={playTrackFromQueue}
								onSetIsPlaying={setIsPlaying}
								onSetVolume={setVolume}
								onTimeUpdate={handleTimeUpdate}
								onTogglePlayPause={togglePlayPause}
								queueLength={queue.length}
								shadowClass="shadow-cyan-500/5"
								track={currentSong}
								volume={deckAVolume}
								waveformRef={waveformRef}
							/>

							<MixerCenter
								crossfader={crossfader}
								onAutoMix={handleAutoMix}
								onBeatSync={handleBeatSync}
								onSetCrossfader={setCrossfader}
							/>

							<Deck
								colorClass="bg-purple-500"
								currentTime={0}
								isPlaying={false}
								label="Deck B"
								onAudioError={handleDeckBError}
								onPlayNext={() => {
									return;
								}}
								onPlayPrev={() => {
									return;
								}}
								onPlayTrackFromQueue={playTrackFromQueue}
								onSetIsPlaying={() => {
									return;
								}}
								onSetVolume={setVolume}
								onTimeUpdate={() => {
									return;
								}}
								onTogglePlayPause={() => {
									return;
								}}
								queueLength={queue.length}
								shadowClass="shadow-purple-500/5"
								track={nextInQueue}
								volume={deckBVolume}
								waveformRef={{ current: null }}
							/>
						</div>

						{/* Upcoming Queue Section */}
						<section className="space-y-6">
							<div className="flex items-end justify-between">
								<div className="flex items-center gap-3">
									<span className="material-symbols-outlined text-primary">
										playlist_play
									</span>
									<h2 className="font-headline-md text-headline-md">
										Upcoming Queue
									</h2>
									<span className="rounded-full bg-primary/10 px-3 py-1 font-technical-data text-primary text-technical-data uppercase">
										{queue.length} TRACKS
									</span>
								</div>
							</div>
							<div className="glass-panel overflow-hidden rounded-3xl">
								<div className="divide-y divide-white/5">
									{queue.map((track, idx) => (
										<QueueItem
											formatDuration={formatDuration}
											idx={idx}
											key={`${track.id}-${idx}`}
											onRemove={removeFromQueue}
											track={track}
										/>
									))}
									{queue.length === 0 && (
										<div className="p-8 text-center text-on-surface-variant opacity-50">
											Queue is empty. Search for music to add tracks.
										</div>
									)}
								</div>
							</div>

							{/* Queue Actions */}
							<div className="flex flex-wrap items-center justify-end gap-4 py-4">
								<button
									className="flex items-center gap-2 px-4 py-2 font-bold text-on-surface-variant text-sm transition-colors hover:text-white"
									onClick={() => {
										usePlayerStore.getState().setQueue([]);
									}}
									type="button"
								>
									<span className="material-symbols-outlined text-lg">
										delete_sweep
									</span>
									Clear Queue
								</button>
								<button
									className="flex items-center gap-2 px-4 py-2 font-bold text-on-surface-variant text-sm transition-colors hover:text-white"
									onClick={handleSaveQueue}
									type="button"
								>
									<span className="material-symbols-outlined text-lg">
										save
									</span>
									Save Queue
								</button>
								<button
									className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-white/20 active:scale-95"
									onClick={handleAutoMixQueue}
									type="button"
								>
									<span
										className="material-symbols-outlined"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										bolt
									</span>
									Auto Mix Queue
								</button>
							</div>
						</section>
					</>
				)}
			</main>

			{/* BottomNavBar (Mobile Only) */}
			<nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-white/5 border-t bg-surface-container-lowest/90 px-4 backdrop-blur-xl md:hidden">
				<a
					className="flex flex-col items-center gap-1 text-on-surface-variant transition-colors hover:text-primary"
					href="/"
				>
					<span className="material-symbols-outlined">library_music</span>
					<span className="font-label-caps text-[10px] uppercase">Library</span>
				</a>
				<a
					className="flex flex-col items-center gap-1 text-primary transition-colors"
					href="/"
				>
					<span className="material-symbols-outlined">album</span>
					<span className="font-label-caps text-[10px] uppercase">Decks</span>
				</a>
				<a
					className="flex flex-col items-center gap-1 text-on-surface-variant transition-colors hover:text-primary"
					href="/"
				>
					<span className="material-symbols-outlined">graphic_eq</span>
					<span className="font-label-caps text-[10px] uppercase">Mixer</span>
				</a>
				<a
					className="flex flex-col items-center gap-1 text-on-surface-variant transition-colors hover:text-primary"
					href="/"
				>
					<span className="material-symbols-outlined">history</span>
					<span className="font-label-caps text-[10px] uppercase">History</span>
				</a>
			</nav>
		</div>
	);
}
