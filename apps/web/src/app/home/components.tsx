import Image from "next/image";
import type { RefObject } from "react";
import { Waveform, type WaveformHandle } from "@/components/waveform";
import type { Track } from "@/store/use-player-store";

const SPEED_TO_BPM: Record<string, string> = {
	verylow: "60-80 BPM",
	low: "80-100 BPM",
	mid: "100-120 BPM",
	high: "120-150 BPM",
	veryhigh: "150-180 BPM",
};

export function QueueItem({
	track,
	idx,
	onRemove,
	formatDuration,
}: {
	track: Track;
	idx: number;
	onRemove: (idx: number) => void;
	formatDuration: (seconds: number) => string;
}) {
	return (
		<div className="group flex items-center gap-6 p-4 transition-all hover:bg-white/5">
			<span className="material-symbols-outlined cursor-grab text-on-surface-variant/40">
				drag_indicator
			</span>
			<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
				<Image
					alt={track.name}
					className="object-cover"
					fill
					src={track.albumImage}
					unoptimized
				/>
			</div>
			<div className="min-w-0 flex-1">
				<h4 className="truncate font-bold text-white">{track.name}</h4>
				<p className="text-on-surface-variant text-xs">{track.artistName}</p>
			</div>
			<div className="hidden h-8 w-32 md:block">
				<div className="flex h-full w-full items-center gap-0.5 opacity-40">
					<div className="h-2 flex-1 bg-primary" />
					<div className="h-4 flex-1 bg-primary" />
					<div className="h-3 flex-1 bg-primary" />
					<div className="h-5 flex-1 bg-primary" />
					<div className="h-2 flex-1 bg-primary" />
				</div>
			</div>
			<div className="w-16 font-technical-data text-on-surface-variant text-technical-data">
				{track.speed ? SPEED_TO_BPM[track.speed] || track.speed : "---"}
			</div>
			<div className="w-12 font-technical-data text-on-surface-variant text-technical-data">
				{formatDuration(track.duration)}
			</div>
			<button
				className="p-2 text-on-surface-variant transition-colors hover:text-error"
				onClick={() => {
					onRemove(idx);
				}}
				type="button"
			>
				<span className="material-symbols-outlined">close</span>
			</button>
		</div>
	);
}

export function MixerCenter({
	crossfader,
	onSetCrossfader,
	onBeatSync,
	onAutoMix,
}: {
	crossfader: number;
	onSetCrossfader: (value: number) => void;
	onBeatSync: () => void;
	onAutoMix: () => void;
}) {
	return (
		<section className="flex flex-col justify-between gap-6 py-4 lg:col-span-4">
			<div className="flex flex-col items-center gap-8">
				<div className="relative flex h-24 w-24 items-center justify-center">
					<div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary/20" />
					<div
						className="absolute inset-2 animate-pulse-ring rounded-full border border-primary/40"
						style={{ animationDelay: "0.5s" }}
					/>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
						<span className="material-symbols-outlined text-on-primary text-xl">
							vibration
						</span>
					</div>
				</div>
				<div className="flex w-full flex-col gap-3 px-8">
					<button
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
						onClick={onBeatSync}
						type="button"
					>
						<span className="material-symbols-outlined">sync</span>
						Beat Sync
					</button>
					<button
						className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
						onClick={onAutoMix}
						type="button"
					>
						<span className="material-symbols-outlined">auto_fix</span>
						Auto Mix
					</button>
				</div>
				<div className="text-center">
					<span className="font-technical-data text-on-surface-variant text-technical-data uppercase tracking-widest">
						BPM Match
					</span>
					<div className="mt-2 flex justify-center gap-1">
						<div className="h-6 w-2 rounded-full bg-tertiary" />
						<div className="h-6 w-2 rounded-full bg-tertiary" />
						<div className="h-6 w-2 rounded-full bg-tertiary" />
						<div className="h-6 w-2 rounded-full bg-tertiary/20" />
						<div className="h-6 w-2 rounded-full bg-tertiary/20" />
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-2 px-6">
				<div className="flex justify-between font-technical-data text-on-surface-variant text-technical-data">
					<span className="">A</span>
					<span className="">B</span>
				</div>
				<div
					aria-label="Crossfader"
					aria-valuemax={1}
					aria-valuemin={-1}
					aria-valuenow={crossfader}
					className="glass-panel relative flex h-12 cursor-pointer items-center rounded-full px-2"
					onClick={(e) => {
						const rect = e.currentTarget.getBoundingClientRect();
						const pos = ((e.clientX - rect.left) / rect.width) * 2 - 1;
						onSetCrossfader(Math.max(-1, Math.min(1, pos)));
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowRight") {
							onSetCrossfader(Math.min(1, crossfader + 0.1));
						}
						if (e.key === "ArrowLeft") {
							onSetCrossfader(Math.max(-1, crossfader - 0.1));
						}
					}}
					role="slider"
					tabIndex={0}
				>
					<div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10" />
					<div
						className="h-8 w-16 cursor-grab rounded-lg bg-white shadow-xl transition-all active:cursor-grabbing"
						style={{
							transform: `translateX(calc(${crossfader * 100}%))`,
							marginLeft: `${(1 - crossfader) * 0}px`, // This is just to trick the calc if needed
							position: "absolute",
							left: "calc(50% - 32px)",
						}}
					>
						<div className="mx-auto h-full w-1 rounded-full bg-slate-200" />
					</div>
				</div>
			</div>
		</section>
	);
}

export function Deck({
	label,
	track,
	isPlaying,
	currentTime,
	volume,
	waveformRef,
	onPlayNext,
	onSetIsPlaying,
	onTimeUpdate,
	onTogglePlayPause,
	onPlayPrev,
	onSetVolume,
	onPlayTrackFromQueue,
	queueLength,
	colorClass,
	shadowClass,
	onAudioError,
}: {
	label: string;
	track: Track | null;
	isPlaying: boolean;
	currentTime: number;
	volume: number;
	waveformRef: RefObject<WaveformHandle | null>;
	onPlayNext: () => void;
	onSetIsPlaying: (playing: boolean) => void;
	onTimeUpdate: (time: number) => void;
	onTogglePlayPause: () => void;
	onPlayPrev: () => void;
	onSetVolume: (volume: number) => void;
	onPlayTrackFromQueue: (idx: number) => void;
	queueLength: number;
	colorClass: string;
	shadowClass: string;
	onAudioError?: () => void;
}) {
	const textColor = colorClass.replace("bg-", "text-");
	const bpmDisplay = track?.speed
		? SPEED_TO_BPM[track.speed] || track.speed
		: "128.00 BPM";

	let title = "Select a track";
	let subtitle = "Ready to play";
	if (label === "Deck B") {
		title = "Queue is empty";
		subtitle = "Add tracks to sync";
	}
	if (track) {
		title = track.name;
		subtitle = track.artistName;
	}

	return (
		<section
			className={`glass-panel group relative flex flex-col gap-6 overflow-hidden rounded-3xl p-6 shadow-2xl lg:col-span-4 ${shadowClass}`}
		>
			<div
				className={`absolute top-0 left-0 h-1 w-full ${colorClass} shadow-[0_0_15px_rgba(6,182,212,0.6)]`}
			/>
			<div className="flex items-center justify-between">
				<h2 className={`font-headline-md text-headline-md ${textColor}`}>
					{label}
				</h2>
				<span
					className={`font-technical-data text-technical-data ${textColor}/70`}
				>
					{bpmDisplay}
				</span>
			</div>
			<div className="flex items-center gap-4">
				<div className="relative h-24 w-24 overflow-hidden rounded-xl bg-surface-container shadow-black/40 shadow-lg">
					{track ? (
						<Image
							alt={track.name}
							className="object-cover"
							fill
							src={track.albumImage}
							unoptimized
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<span className="material-symbols-outlined text-4xl text-on-surface-variant">
								music_note
							</span>
						</div>
					)}
				</div>
				<div className="min-w-0">
					<h3 className="truncate font-headline-md text-headline-md text-white">
						{title}
					</h3>
					<p className="truncate text-on-surface-variant">{subtitle}</p>
				</div>
			</div>

			{/* Waveform */}
			<div className="relative flex h-32 items-center justify-center">
				{track ? (
					<Waveform
						audioUrl={track.audio}
						initialTime={currentTime}
						isPlaying={isPlaying}
						onError={onAudioError}
						onFinish={onPlayNext}
						onPlayStateChange={onSetIsPlaying}
						onTimeUpdate={onTimeUpdate}
						peaks={track.waveform}
						ref={waveformRef}
						volume={volume}
					/>
				) : (
					<div className="flex flex-col items-center gap-2 opacity-30">
						<span className={`material-symbols-outlined ${textColor}`}>
							graphic_eq
						</span>
						<span className="font-technical-data text-technical-data uppercase">
							{label === "Deck B" ? "WAITING FOR TRACK" : "NO AUDIO LOADED"}
						</span>
					</div>
				)}
			</div>

			{/* Controls */}
			{label === "Deck A" ? (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button
							className="text-on-surface-variant transition-colors hover:text-cyan-400"
							disabled={!track}
							onClick={() => {
								onPlayPrev();
							}}
							type="button"
						>
							<span className="material-symbols-outlined">skip_previous</span>
						</button>
						<button
							className={`h-14 w-14 rounded-full ${colorClass} flex items-center justify-center text-surface shadow-cyan-500/20 shadow-lg transition-all hover:scale-105 active:scale-95`}
							disabled={!track}
							onClick={() => {
								onTogglePlayPause();
							}}
							type="button"
						>
							<span
								className="material-symbols-outlined"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								{isPlaying ? "pause" : "play_arrow"}
							</span>
						</button>
						<button
							className="text-on-surface-variant transition-colors hover:text-cyan-400"
							disabled={queueLength === 0}
							onClick={() => {
								onPlayNext();
							}}
							type="button"
						>
							<span className="material-symbols-outlined">skip_next</span>
						</button>
					</div>
					<div className="flex items-center gap-4">
						<span className="material-symbols-outlined text-on-surface-variant text-sm">
							volume_up
						</span>
						<div
							aria-valuemax={100}
							aria-valuemin={0}
							aria-valuenow={volume * 100}
							className="h-1 w-24 cursor-pointer overflow-hidden rounded-full bg-white/10"
							onClick={(e) => {
								const rect = e.currentTarget.getBoundingClientRect();
								const pos = Math.max(
									0,
									Math.min(1, (e.clientX - rect.left) / rect.width)
								);
								onSetVolume(pos);
							}}
							onKeyDown={(e) => {
								if (e.key === "ArrowRight") {
									onSetVolume(Math.min(1, volume + 0.1));
								}
								if (e.key === "ArrowLeft") {
									onSetVolume(Math.max(0, volume - 0.1));
								}
							}}
							role="slider"
							tabIndex={0}
						>
							<div
								className={`h-full ${colorClass}`}
								style={{ width: `${volume * 100}%` }}
							/>
						</div>
						<button
							className="text-on-surface-variant hover:text-cyan-400"
							type="button"
						>
							<span className="material-symbols-outlined">repeat</span>
						</button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3">
					<button
						className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold text-on-surface text-sm transition-all hover:bg-white/10"
						disabled={!track}
						onClick={() => {
							if (track) {
								onPlayTrackFromQueue(0);
							}
						}}
						type="button"
					>
						Load Deck
					</button>
					<button
						className={`rounded-xl py-3 ${colorClass} font-bold text-sm text-white shadow-lg shadow-purple-500/20 transition-all hover:brightness-110`}
						disabled={!track}
						onClick={() => {
							if (track) {
								onPlayTrackFromQueue(0);
							}
						}}
						type="button"
					>
						Mix Now
					</button>
				</div>
			)}
		</section>
	);
}
