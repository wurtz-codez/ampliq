"use client";

import type { auth } from "@ampliq/auth";
import { Button } from "@ampliq/ui/components/button";
import { Input } from "@ampliq/ui/components/input";
import { Pause, Play, SkipBack, SkipForward, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Track {
	albumId: string;
	albumImage: string;
	albumName: string;
	artistId: string;
	artistName: string;
	audio: string;
	audioDownload: string;
	audioDownloadAllowed: boolean;
	duration: number;
	id: string;
	licenseUrl: string;
	name: string;
	releaseDate: string;
}

interface SearchResponse {
	total: number;
	tracks: Track[];
}

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HomePage({
	session,
}: {
	session: typeof auth.$Infer.Session;
}) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Track[]>([]);
	const [loading, setLoading] = useState(false);
	const [queue, setQueue] = useState<Track[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const currentTrack = queue[currentIndex] ?? null;

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
			setResults(data.tracks);
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

	const addToQueue = useCallback((track: Track) => {
		setQueue((prev) => {
			if (prev.some((t) => t.id === track.id)) {
				return prev;
			}
			return [...prev, track];
		});
		setCurrentIndex((prev) => (prev === -1 ? 0 : prev));
	}, []);

	const removeFromQueue = useCallback(
		(index: number) => {
			setQueue((prev) => {
				const next = prev.filter((_, i) => i !== index);
				if (currentIndex >= next.length) {
					setCurrentIndex(next.length - 1);
				}
				return next;
			});
		},
		[currentIndex]
	);

	const playTrack = useCallback(
		(index: number) => {
			if (index >= 0 && index < queue.length) {
				setCurrentIndex(index);
				setIsPlaying(true);
			}
		},
		[queue.length]
	);

	const togglePlayPause = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play().catch(() => setIsPlaying(false));
		}
	}, [isPlaying]);

	const playNext = useCallback(() => {
		if (currentIndex < queue.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setIsPlaying(true);
		}
	}, [currentIndex, queue.length]);

	const playPrev = useCallback(() => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
			setIsPlaying(true);
		}
	}, [currentIndex]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		if (!currentTrack) {
			return;
		}

		audio.src = currentTrack.audio;
		if (isPlaying) {
			audio.play().catch(() => setIsPlaying(false));
		}
	}, [currentTrack, isPlaying]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const onEnded = () => {
			if (currentIndex < queue.length - 1) {
				setCurrentIndex((prev) => prev + 1);
				setIsPlaying(true);
			} else {
				setIsPlaying(false);
			}
		};

		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);

		audio.addEventListener("ended", onEnded);
		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);

		return () => {
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
		};
	}, [currentIndex, queue.length]);

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h1 className="font-bold text-4xl">
					Welcome, {session.user.name.split(" ")[0]}
				</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					Search Jamendo for music to stream
				</p>
			</div>

			<div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
				<Input
					className="w-full rounded-xl border-border/50 bg-background/50 p-4 text-lg placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
					onChange={(e) => {
						setQuery(e.target.value);
						debouncedSearch(e.target.value);
					}}
					placeholder="Search for a song or artist..."
					type="text"
					value={query}
				/>

				{loading && (
					<p className="mt-4 text-center text-muted-foreground">Searching...</p>
				)}

				{results.length > 0 && (
					<div className="mt-4 space-y-2">
						<p className="text-muted-foreground text-sm">
							Results — click to add to queue
						</p>
						{results.map((track) => (
							<button
								className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-primary/5"
								key={track.id}
								onClick={() => addToQueue(track)}
								type="button"
							>
								{track.albumImage ? (
									<Image
										alt={track.albumName}
										className="rounded-lg object-cover"
										height={48}
										src={track.albumImage}
										unoptimized
										width={48}
									/>
								) : (
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
										<Play className="h-5 w-5 text-muted-foreground" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">{track.name}</p>
									<p className="truncate text-muted-foreground text-sm">
										{track.artistName} · {track.albumName}
									</p>
								</div>
								<span className="shrink-0 text-muted-foreground text-sm">
									{formatDuration(track.duration)}
								</span>
							</button>
						))}
					</div>
				)}
			</div>

			{queue.length > 0 && (
				<div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
					<h2 className="mb-4 font-semibold text-lg">Queue</h2>

					{currentTrack && (
						<div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
							<div className="mb-3 flex items-center gap-4">
								{currentTrack.albumImage ? (
									<Image
										alt={currentTrack.albumName}
										className="rounded-xl object-cover"
										height={64}
										src={currentTrack.albumImage}
										unoptimized
										width={64}
									/>
								) : (
									<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted" />
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold text-lg">
										{currentTrack.name}
									</p>
									<p className="truncate text-muted-foreground text-sm">
										{currentTrack.artistName}
									</p>
								</div>
								<span className="text-muted-foreground text-sm">
									{formatDuration(currentTrack.duration)}
								</span>
							</div>

							<div className="flex items-center justify-center gap-3">
								<Button
									disabled={currentIndex <= 0}
									onClick={playPrev}
									size="icon"
									variant="ghost"
								>
									<SkipBack className="h-5 w-5" />
								</Button>
								<Button
									className="h-12 w-12 rounded-full"
									onClick={togglePlayPause}
									size="icon"
								>
									{isPlaying ? (
										<Pause className="h-6 w-6" />
									) : (
										<Play className="h-6 w-6" />
									)}
								</Button>
								<Button
									disabled={currentIndex >= queue.length - 1}
									onClick={playNext}
									size="icon"
									variant="ghost"
								>
									<SkipForward className="h-5 w-5" />
								</Button>
							</div>
						</div>
					)}

					<div className="space-y-1">
						{queue.map((track, index) => (
							<div
								className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-primary/5 ${
									index === currentIndex ? "bg-primary/10" : ""
								}`}
								key={`${track.id}-${index}`}
							>
								<button
									className="flex flex-1 items-center gap-3 text-left"
									onClick={() => playTrack(index)}
									type="button"
								>
									{track.albumImage ? (
										<Image
											alt={track.albumName}
											className="rounded-lg object-cover"
											height={36}
											src={track.albumImage}
											unoptimized
											width={36}
										/>
									) : (
										<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted" />
									)}
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">{track.name}</p>
										<p className="truncate text-muted-foreground text-xs">
											{track.artistName}
										</p>
									</div>
									<span className="text-muted-foreground text-xs">
										{formatDuration(track.duration)}
									</span>
								</button>
								<Button
									onClick={() => removeFromQueue(index)}
									size="icon"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4 text-muted-foreground" />
								</Button>
							</div>
						))}
					</div>

					<audio preload="auto" ref={audioRef}>
						<track kind="captions" />
					</audio>
				</div>
			)}
		</div>
	);
}
