
import { TmdbResponse } from "../types";

const PROXY_BASE = "https://d1j3vi2u94ebt0.netlify.app/api/tmdb";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

export const getImageUrl = (path?: string) => path ? `${IMG_BASE}${path}` : null;
export const getBackdropUrl = (path?: string) => path ? `${BACKDROP_BASE}${path}` : null;

export const searchTmdb = async (query: string): Promise<TmdbResponse> => {
    if (!query) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    
    // Using multi-search to find movies, tv shows, and people
    const url = `${PROXY_BASE}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDB Error: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error("TMDB Search Failed", e);
        throw e;
    }
};

export const getTmdbTrending = async (type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'day'): Promise<TmdbResponse> => {
    const url = `${PROXY_BASE}/trending/${type}/${timeWindow}?language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDB Error: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error("TMDB Trending Failed", e);
        throw e;
    }
};
