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

		useEffect(() => {
			if (!waveformRef.current) {
				return;
			}

			let destroyed = false;
			let startFrom = initialTime;

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

				if (startFrom > 0) {
					ws.setTime(startFrom);
					startFrom = 0; // Only use once
				}

				onReady?.();

				if (isPlaying) {
					ws.play().catch(() => {
						onPlayStateChange?.(false);
					});
				}
			});

			ws.on("finish", () => {
				if (!destroyed) {
					onFinish?.();
				}
			});

			ws.on("audioprocess", (currentTime) => {
				if (!destroyed) {
					onTimeUpdate?.(currentTime);
				}
			});

			ws.on("play", () => {
				if (!destroyed) {
					onPlayStateChange?.(true);
				}
			});

			ws.on("pause", () => {
				if (!destroyed) {
					onPlayStateChange?.(false);
				}
			});

			// Sync seeking with time update
			ws.on("interaction", () => {
				if (!destroyed) {
					onTimeUpdate?.(ws.getCurrentTime());
				}
			});

			return () => {
				destroyed = true;
				try {
					ws.destroy();
				} catch {
					// ignore
				}
			};
		}, [
			audioUrl,
			peaks,
			onReady,
			onFinish,
			onTimeUpdate,
			onPlayStateChange,
			isPlaying,
			initialTime,
		]);

		useEffect(() => {
			if (wavesurfer.current && isLoaded) {
				wavesurfer.current.setVolume(volume);
			}
		}, [volume, isLoaded]);

		useEffect(() => {
			if (wavesurfer.current && isLoaded) {
				if (isPlaying) {
					wavesurfer.current.play().catch(() => {
						// Ignore playback errors
					});
				} else {
					wavesurfer.current.pause();
				}
			}
		}, [isPlaying, isLoaded]);

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
