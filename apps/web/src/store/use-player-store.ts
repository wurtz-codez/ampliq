import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Track {
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
	speed?: string;
	waveform?: string;
}

interface PlayerState {
	addToQueue: (track: Track) => void;

	// Crossfader: -1 (Deck A) to 1 (Deck B)
	crossfader: number;
	currentSong: Track | null;
	currentTime: number;
	isPlaying: boolean;
	playNext: () => void;
	playNow: (track: Track) => void;
	playTrackFromQueue: (index: number) => void;
	queue: Track[];
	removeFromQueue: (index: number) => void;
	setCrossfader: (value: number) => void;

	// Actions
	setCurrentSong: (song: Track | null) => void;
	setCurrentTime: (time: number) => void;
	setIsPlaying: (isPlaying: boolean) => void;
	setQueue: (queue: Track[] | ((prev: Track[]) => Track[])) => void;
	setVolume: (volume: number) => void;
	volume: number;
}

export const usePlayerStore = create<PlayerState>()(
	persist(
		(set, get) => ({
			currentSong: null,
			queue: [],
			currentTime: 0,
			isPlaying: false,
			volume: 0.7,
			crossfader: 0,

			setCurrentSong: (song) => set({ currentSong: song }),
			setQueue: (queueOrUpdater) => {
				if (typeof queueOrUpdater === "function") {
					set({ queue: queueOrUpdater(get().queue) });
				} else {
					set({ queue: queueOrUpdater });
				}
			},
			setCurrentTime: (time) => set({ currentTime: time }),
			setIsPlaying: (isPlaying) => set({ isPlaying }),
			setVolume: (volume) => set({ volume }),
			setCrossfader: (crossfader) => set({ crossfader }),

			addToQueue: (track) => {
				const { queue } = get();
				if (queue.some((t) => t.id === track.id)) {
					return;
				}
				set({ queue: [...queue, track] });
			},

			removeFromQueue: (index) => {
				const { queue } = get();
				set({ queue: queue.filter((_, i) => i !== index) });
			},

			playNow: (track) => {
				set({
					currentSong: track,
					isPlaying: true,
					currentTime: 0,
				});
			},

			playNext: () => {
				const { queue } = get();
				if (queue.length === 0) {
					set({ currentSong: null, isPlaying: false, currentTime: 0 });
					return;
				}
				const [next, ...rest] = queue;
				set({
					currentSong: next,
					queue: rest,
					isPlaying: true,
					currentTime: 0,
				});
			},

			playTrackFromQueue: (index) => {
				const { queue } = get();
				const track = queue[index];
				if (!track) {
					return;
				}
				set({
					currentSong: track,
					queue: queue.filter((_, i) => i !== index),
					isPlaying: true,
					currentTime: 0,
				});
			},
		}),
		{
			name: "ampliq-player-storage",
			// We only want to persist these fields
			partialize: (state) => ({
				currentSong: state.currentSong,
				queue: state.queue,
				volume: state.volume,
				crossfader: state.crossfader,
			}),
		}
	)
);
