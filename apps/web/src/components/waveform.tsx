"use client";

import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformProps {
	audioUrl: string;
	initialTime?: number;
	isPlaying: boolean;
	onFinish?: () => void;
	onPlayStateChange?: (playing: boolean) => void;
	onReady?: () => void;
	onTimeUpdate?: (currentTime: number) => void;
	peaks?: string;
	volume: number;
}

export interface WaveformHandle {
	seekTo: (progress: number) => void;
	seekToTime: (time: number) => void;
}

export const Waveform = forwardRef<WaveformHandle, WaveformProps>(
	(
		{
			audioUrl,
			peaks,
			isPlaying,
			volume,
			initialTime = 0,
			onReady,
			onFinish,
			onTimeUpdate,
			onPlayStateChange,
		},
		ref
	) => {
		const waveformRef = useRef<HTMLDivElement>(null);
		const wavesurfer = useRef<WaveSurfer | null>(null);
		const [isLoaded, setIsLoaded] = useState(false);

		// Keep callbacks in refs to avoid re-initializing WaveSurfer
		const onReadyRef = useRef(onReady);
		const onFinishRef = useRef(onFinish);
		const onTimeUpdateRef = useRef(onTimeUpdate);
		const onPlayStateChangeRef = useRef(onPlayStateChange);
		const isPlayingRef = useRef(isPlaying);
		const initialTimeRef = useRef(initialTime);

		useEffect(() => {
			onReadyRef.current = onReady;
		}, [onReady]);

		useEffect(() => {
			onFinishRef.current = onFinish;
		}, [onFinish]);

		useEffect(() => {
			onTimeUpdateRef.current = onTimeUpdate;
		}, [onTimeUpdate]);

		useEffect(() => {
			onPlayStateChangeRef.current = onPlayStateChange;
		}, [onPlayStateChange]);

		useEffect(() => {
			isPlayingRef.current = isPlaying;
		}, [isPlaying]);

		useEffect(() => {
			initialTimeRef.current = initialTime;
		}, [initialTime]);

		useImperativeHandle(
			ref,
			() => ({
				seekTo: (progress: number) => {
					if (wavesurfer.current) {
						wavesurfer.current.seekTo(progress);
					}
				},
				seekToTime: (time: number) => {
					if (wavesurfer.current) {
						wavesurfer.current.setTime(time);
					}
				},
			}),
			[]
		);

		// Main initialization effect - only runs when audioUrl or peaks change
		useEffect(() => {
			if (!waveformRef.current) {
				return;
			}

			let destroyed = false;

			let normalizedPeaks: number[] | undefined;
			if (peaks) {
				normalizedPeaks = peaks
					.split(" ")
					.map((p) => Number.parseInt(p, 10) / 100);
			}

			const ws = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: "rgba(255, 255, 255, 0.2)",
				progressColor: "#3b82f6",
				cursorColor: "#3b82f6",
				barWidth: 2,
				barGap: 3,
				barRadius: 3,
				height: 48,
				cursorWidth: 1,
				normalize: true,
				interact: true,
				hideScrollbar: true,
			});

			wavesurfer.current = ws;

			if (normalizedPeaks && normalizedPeaks.length > 0) {
				ws.load(audioUrl, [normalizedPeaks]);
			} else {
				ws.load(audioUrl);
			}

			ws.on("ready", () => {
				if (destroyed) {
					return;
				}
				setIsLoaded(true);

				// Restore time from persisted state
				if (initialTimeRef.current > 0) {
					ws.setTime(initialTimeRef.current);
				}

				onReadyRef.current?.();

				if (isPlayingRef.current) {
					ws.play().catch(() => {
						onPlayStateChangeRef.current?.(false);
					});
				}
			});

			ws.on("finish", () => {
				if (!destroyed) {
					onFinishRef.current?.();
				}
			});

			ws.on("audioprocess", (currentTime) => {
				if (!destroyed) {
					onTimeUpdateRef.current?.(currentTime);
				}
			});

			ws.on("play", () => {
				if (!destroyed) {
					onPlayStateChangeRef.current?.(true);
				}
			});

			ws.on("pause", () => {
				if (!destroyed) {
					onPlayStateChangeRef.current?.(false);
				}
			});

			ws.on("interaction", () => {
				if (!destroyed) {
					onTimeUpdateRef.current?.(ws.getCurrentTime());
				}
			});

			return () => {
				destroyed = true;
				if (wavesurfer.current) {
					const ws = wavesurfer.current;
					wavesurfer.current = null;
					try {
						ws.destroy();
					} catch (e) {
						// Ignore AbortError and other destruction errors
						if (e instanceof Error && e.name === "AbortError") {
							return;
						}
					}
				}
			};
		}, [audioUrl, peaks]);

		// Sync play/pause state without reinitializing WaveSurfer
		useEffect(() => {
			if (!wavesurfer.current) {
				return;
			}

			if (!isLoaded) {
				return;
			}

			if (isPlaying) {
				wavesurfer.current.play().catch(() => {
					// Ignore autoplay restrictions
				});
			} else {
				wavesurfer.current.pause();
			}
		}, [isPlaying, isLoaded]);

		// Sync volume
		useEffect(() => {
			if (wavesurfer.current && isLoaded) {
				wavesurfer.current.setVolume(volume);
			}
		}, [volume, isLoaded]);

		return (
			<div className="relative w-full">
				{!isLoaded && (
					<div className="absolute inset-0 flex animate-pulse items-center justify-center rounded-md bg-white/5">
						<span className="text-muted-foreground text-xs">
							Loading waveform...
						</span>
					</div>
				)}
				<div className="w-full" ref={waveformRef} />
			</div>
		);
	}
);

Waveform.displayName = "Waveform";
