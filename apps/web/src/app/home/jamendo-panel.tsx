"use client";

import { Mic, Play } from "lucide-react";
import Image from "next/image";
import type { Track } from "@/store/use-player-store";

interface JamendoPanelProps {
	addToQueue: (track: Track) => void;
	handlePlayNow: (track: Track) => void;
	loading: boolean;
	query: string;
	results: Track[];
}

export function JamendoPanel({
	query,
	loading,
	results,
	handlePlayNow,
	addToQueue,
}: JamendoPanelProps) {
	if (query.trim().length > 0 || results.length > 0) {
		return (
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
						<p className="mt-10 text-center text-[#c7c4d7]">No tracks found.</p>
					)}
				</div>
			</div>
		);
	}

	return (
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
					<p className="font-semibold text-[#e4e1ed] text-[24px]">Tap to Hum</p>
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
						<p className="truncate text-[#c7c4d7] text-[16px]">Cyberheart</p>
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
	);
}
