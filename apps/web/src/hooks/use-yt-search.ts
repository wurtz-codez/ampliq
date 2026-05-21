import { useCallback, useState } from "react";

export interface YouTubeSearchResult {
	duration: number;
	id: string;
	thumbnail: string;
	title: string;
	uploader: string;
	url: string;
}

export function useYtSearch() {
	const [results, setResults] = useState<YouTubeSearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const search = useCallback(async (query: string) => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch(
				`/api/yt-dlp/search?q=${encodeURIComponent(query)}`
			);
			if (!res.ok) {
				throw new Error("Search failed");
			}
			const data = await res.json();
			setResults(data.results || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Search failed");
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const clearResults = useCallback(() => {
		setResults([]);
		setError(null);
	}, []);

	return { results, loading, error, search, clearResults };
}
