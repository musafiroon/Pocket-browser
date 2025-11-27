
import { SpotifyConfig, SpotifySearchResults } from "../types";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";

export const getSpotifyToken = async (config: SpotifyConfig): Promise<string> => {
    if (!config.clientId || !config.clientSecret) {
        throw new Error("Missing Client ID or Secret");
    }

    const authString = btoa(`${config.clientId}:${config.clientSecret}`);
    
    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error_description || `Auth Error ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (e: any) {
        console.error("Spotify Auth Error:", e);
        throw new Error(e.message || "Failed to authenticate");
    }
};

export const searchSpotify = async (query: string, token: string): Promise<SpotifySearchResults> => {
    if (!query) return { artists: [], playlists: [], tracks: [] };

    // Request artist, playlist, and track types
    const url = `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=artist,playlist,track&limit=12`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("401"); // Special signal for token refresh
        throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        artists: data.artists?.items || [],
        playlists: data.playlists?.items || [],
        tracks: data.tracks?.items || []
    };
};
