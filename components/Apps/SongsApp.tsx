import React, { useState, useEffect } from 'react';
import { Music, Search, Settings, Heart, Play, X, Key, ImageOff, Disc, List, Loader2, AlertCircle, Mic2, Users, Maximize2, Minimize2, ChevronUp } from 'lucide-react';
import { SpotifyConfig, SpotifyTrack, SpotifyPlaylist, SpotifyArtist, SpotifyImage } from '../../types';
import { getSpotifyToken, searchSpotify } from '../../services/spotifyService';

// --- Helper Functions ---

const getSafeImage = (images?: SpotifyImage[]): string | null => {
    if (Array.isArray(images) && images.length > 0 && images[0] && images[0].url) {
        return images[0].url;
    }
    return null;
};

const getArtistNames = (track: SpotifyTrack): string => {
    if (Array.isArray(track.artists) && track.artists.length > 0) {
        return track.artists.map(a => a.name || 'Unknown').join(', ');
    }
    return 'Unknown Artist';
};

// --- Components ---

const ImageWithFallback: React.FC<{ src?: string | null, alt: string, className?: string, isRound?: boolean }> = ({ src, alt, className, isRound }) => {
    if (src) {
        return <img src={src} alt={alt} className={`${className} object-cover`} />;
    }
    return (
        <div className={`${className} bg-gray-800 flex items-center justify-center text-gray-600`}>
            {isRound ? <Mic2 size={24} /> : <ImageOff size={20} />}
        </div>
    );
};

const SongsApp: React.FC = () => {
    // --- State ---
    const [view, setView] = useState<'search' | 'favorites' | 'settings'>('search');
    const [config, setConfig] = useState<SpotifyConfig>({ clientId: '', clientSecret: '' });
    const [token, setToken] = useState<string>('');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ artists: SpotifyArtist[], playlists: SpotifyPlaylist[] }>({ artists: [], playlists: [] });
    const [favorites, setFavorites] = useState<SpotifyTrack[]>([]);
    
    const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string | null>(null);
    const [playerMode, setPlayerMode] = useState<'compact' | 'standard' | 'large'>('standard');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Effects ---
    
    useEffect(() => {
        try {
            const savedConfig = localStorage.getItem('spotify_config');
            if (savedConfig) setConfig(JSON.parse(savedConfig));
            
            const savedFavs = localStorage.getItem('spotify_favorites');
            if (savedFavs) setFavorites(JSON.parse(savedFavs));
        } catch (e) {
            console.error("Failed to load local storage", e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('spotify_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // --- Actions ---

    const handleSaveConfig = () => {
        localStorage.setItem('spotify_config', JSON.stringify(config));
        setToken(''); // Clear token to force re-auth
        setError(null);
        setView('search');
    };

    const authenticate = async (): Promise<string | null> => {
        if (!config.clientId || !config.clientSecret) {
            setError("Missing Client ID/Secret. Please configure in Settings.");
            return null;
        }
        try {
            const newToken = await getSpotifyToken(config);
            setToken(newToken);
            return newToken;
        } catch (err: any) {
            setError(`Auth Error: ${err.message}`);
            return null;
        }
    };

    const executeSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);

        let activeToken = token;
        
        // 1. Ensure Token
        if (!activeToken) {
            const newToken = await authenticate();
            if (!newToken) {
                setIsLoading(false);
                return;
            }
            activeToken = newToken;
        }

        // 2. Perform Search with Retry Logic
        try {
            const results = await searchSpotify(searchQuery, activeToken);
            setSearchResults({
                artists: results.artists || [],
                playlists: results.playlists || []
            });
        } catch (err: any) {
            if (err.message === '401') {
                // Token expired, refresh and retry once
                console.log("Token expired, refreshing...");
                const newToken = await authenticate();
                if (newToken) {
                    try {
                        const results = await searchSpotify(searchQuery, newToken);
                        setSearchResults({
                            artists: results.artists || [],
                            playlists: results.playlists || []
                        });
                    } catch (retryErr: any) {
                        setError("Search failed after refresh. Please check API quotas.");
                    }
                }
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = (track: SpotifyTrack) => {
        if (!track || !track.id) return;
        const exists = favorites.some(f => f.id === track.id);
        if (exists) {
            setFavorites(prev => prev.filter(f => f.id !== track.id));
        } else {
            setFavorites(prev => [...prev, track]);
        }
    };

    const playUri = (uri: string) => {
        if (!uri) return;
        console.log("Attempting to embed URI:", uri);
        const parts = uri.split(':');
        if (parts.length === 3) {
            const type = parts[1];
            const id = parts[2];
            // Ensure embed shows art by default using standard size
            const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
            setCurrentEmbedUrl(embedUrl);
            setPlayerMode('standard');
        }
    };

    // --- Render Helpers ---

    const renderTrackItem = (track: SpotifyTrack) => {
        if (!track) return null; // Defensive check
        const isFav = favorites.some(f => f.id === track.id);
        const imageUrl = getSafeImage(track.album?.images);
        const artistText = getArtistNames(track);

        return (
            <div key={track.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors">
                <div 
                    className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer"
                    onClick={() => playUri(track.uri)}
                >
                    <div className="w-12 h-12 shrink-0 rounded overflow-hidden shadow-sm relative">
                        <ImageWithFallback src={imageUrl} alt={track.name} className="w-full h-full" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={16} fill="white" className="text-white"/>
                        </div>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-white truncate group-hover:text-green-400 transition-colors">
                            {track.name || 'Unknown Track'}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                            {artistText}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }} className="p-2 hover:bg-white/10 rounded-full">
                         <Heart size={18} className={isFav ? "fill-green-500 text-green-500" : "text-gray-400"} />
                     </button>
                </div>
            </div>
        );
    };

    const renderArtistItem = (artist: SpotifyArtist) => {
        if (!artist) return null;
        const imageUrl = getSafeImage(artist.images);

        return (
            <div 
                key={artist.id} 
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group flex flex-col items-center text-center"
                onClick={() => playUri(artist.uri)}
            >
                <div className="aspect-square w-32 h-32 mb-4 relative shadow-lg rounded-full overflow-hidden">
                    <ImageWithFallback src={imageUrl} alt={artist.name} className="w-full h-full" isRound={true} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Play size={24} fill="white" className="text-white"/>
                    </div>
                </div>
                <h3 className="font-bold text-white text-base truncate w-full">{artist.name || 'Unknown Artist'}</h3>
                <p className="text-xs text-gray-400 mt-1">Artist</p>
            </div>
        );
    };

    const renderPlaylistItem = (playlist: SpotifyPlaylist) => {
        if (!playlist) return null;
        const imageUrl = getSafeImage(playlist.images);

        return (
            <div 
                key={playlist.id} 
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group flex flex-col"
                onClick={() => playUri(playlist.uri)}
            >
                <div className="aspect-square w-full mb-3 relative shadow-lg rounded-md overflow-hidden">
                    <ImageWithFallback src={imageUrl} alt={playlist.name} className="w-full h-full" />
                    <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={20} fill="black" className="text-black ml-1" />
                    </button>
                </div>
                <h3 className="font-bold text-white text-sm truncate">{playlist.name || 'Untitled'}</h3>
                <p className="text-xs text-gray-400 mt-1 truncate">
                    By {playlist.owner?.display_name || 'Unknown'}
                </p>
            </div>
        );
    };

    // --- Main Render ---

    // Calculate dynamic height classes for player
    const getPlayerHeightClass = () => {
        if (playerMode === 'compact') return 'h-[80px]';
        if (playerMode === 'standard') return 'h-[200px]';
        return 'h-[60%]';
    };

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden">
            
            {/* Nav */}
            <div className="shrink-0 h-16 bg-[#121212] border-b border-[#282828] flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2 text-green-500 font-bold text-xl">
                    <Music size={24} />
                    <span className="hidden md:inline">Spotify Connect</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('search')} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'search' ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Search
                    </button>
                    <button 
                        onClick={() => setView('favorites')} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'favorites' ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Liked Songs
                    </button>
                    <button 
                        onClick={() => setView('settings')} 
                        className={`p-2 rounded-full text-gray-400 hover:text-white ${view === 'settings' ? 'bg-[#282828] text-white' : ''}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {/* Global Error Banner */}
                {error && (
                    <div className="absolute top-4 left-4 right-4 z-50 bg-red-500/90 text-white p-3 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur animate-fade-in">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium flex-1">{error}</span>
                        <button onClick={() => setError(null)}><X size={18}/></button>
                    </div>
                )}

                {/* View: Settings */}
                {view === 'settings' && (
                    <div className="flex-1 overflow-y-auto min-h-0 p-6 flex flex-col items-center pt-20">
                        <div className="w-full max-w-md bg-[#181818] p-8 rounded-2xl shadow-2xl border border-[#282828]">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><Key className="text-green-500" /> API Setup</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client ID</label>
                                    <input 
                                        type="text" 
                                        value={config.clientId}
                                        onChange={e => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                                        className="w-full bg-[#282828] border border-transparent focus:border-green-500 rounded-lg p-3 text-white outline-none transition-colors"
                                        placeholder="Spotify Client ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client Secret</label>
                                    <input 
                                        type="password" 
                                        value={config.clientSecret}
                                        onChange={e => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                                        className="w-full bg-[#282828] border border-transparent focus:border-green-500 rounded-lg p-3 text-white outline-none transition-colors"
                                        placeholder="Spotify Client Secret"
                                    />
                                </div>
                                <button 
                                    onClick={handleSaveConfig}
                                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full transition-transform active:scale-95 mt-4"
                                >
                                    Save Configuration
                                </button>
                                <p className="text-xs text-gray-500 text-center leading-relaxed">
                                    Get credentials at <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-white">developer.spotify.com</a>.
                                    <br/>Keys are stored locally in your browser.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Search */}
                {view === 'search' && (
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="p-4 bg-gradient-to-b from-[#202020] to-[#121212] shrink-0">
                            <div className="max-w-3xl mx-auto relative">
                                <div className="absolute left-4 top-3.5 text-gray-400 pointer-events-none">
                                    <Search size={20} />
                                </div>
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && executeSearch()}
                                    placeholder="Search artists or playlists..."
                                    className="w-full bg-[#333] hover:bg-[#3a3a3a] focus:bg-[#333] text-white rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-gray-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-3">
                                    <Loader2 size={32} className="animate-spin text-green-500" />
                                    <span className="text-sm">Searching Spotify...</span>
                                </div>
                            ) : (
                                <div className="max-w-5xl mx-auto space-y-8 pb-20">
                                    
                                    {/* Artists Section */}
                                    {searchResults.artists.length > 0 && (
                                        <section>
                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Mic2 size={20}/> Artists</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {searchResults.artists.map(renderArtistItem)}
                                            </div>
                                        </section>
                                    )}

                                    {/* Playlists Section */}
                                    {searchResults.playlists.length > 0 && (
                                        <section>
                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><List size={20}/> Playlists</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {searchResults.playlists.map(renderPlaylistItem)}
                                            </div>
                                        </section>
                                    )}

                                    {/* Empty State */}
                                    {!isLoading && searchResults.artists.length === 0 && searchResults.playlists.length === 0 && searchQuery && (
                                        <div className="text-center text-gray-500 mt-20">
                                            <p>No artists or playlists found for "{searchQuery}"</p>
                                        </div>
                                    )}
                                     {!isLoading && !searchQuery && (
                                        <div className="text-center text-gray-600 mt-20 flex flex-col items-center">
                                            <Music size={48} className="mb-4 opacity-50"/>
                                            <p className="font-medium">Search for artists or playlists to play</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* View: Favorites */}
                {view === 'favorites' && (
                    <div className="flex-1 overflow-y-auto min-h-0 p-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="bg-gradient-to-br from-green-400 to-blue-500 p-2 rounded-lg">
                                    <Heart size={24} fill="white" className="text-white"/>
                                </div>
                                Liked Songs
                            </h2>
                            {favorites.length === 0 ? (
                                <div className="text-center text-gray-500 py-20 bg-[#181818] rounded-xl border border-[#282828]">
                                    <p>Your library is empty.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {favorites.map(renderTrackItem)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Player Bar */}
                {currentEmbedUrl && (
                    <div className={`${getPlayerHeightClass()} bg-black border-t border-[#282828] w-full shrink-0 relative z-30 transition-all duration-300 ease-in-out`}>
                        <div className="absolute right-2 top-[-32px] flex items-end justify-end">
                            <div className="bg-[#181818] rounded-t-lg border-t border-x border-[#282828] flex items-center overflow-hidden shadow-xl">
                                <button 
                                    onClick={() => setPlayerMode(playerMode === 'compact' ? 'standard' : 'compact')}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#282828] border-r border-[#282828]"
                                    title={playerMode === 'compact' ? "Show Artwork (Standard)" : "Minimize to Bar"}
                                >
                                    {playerMode === 'compact' ? <ChevronUp size={14}/> : <Minimize2 size={14}/>}
                                </button>
                                <button 
                                    onClick={() => setPlayerMode(playerMode === 'large' ? 'standard' : 'large')}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#282828] border-r border-[#282828]"
                                    title={playerMode === 'large' ? "Standard View" : "Maximize Playlist View"}
                                >
                                    {playerMode === 'large' ? <ChevronUp size={14} className="rotate-180"/> : <Maximize2 size={14}/>}
                                </button>
                                <button 
                                    onClick={() => setCurrentEmbedUrl(null)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                    title="Close Player"
                                >
                                    <X size={14}/>
                                </button>
                            </div>
                        </div>
                        <iframe 
                            src={currentEmbedUrl} 
                            width="100%" 
                            height="100%" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy" 
                            className="w-full h-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongsApp;