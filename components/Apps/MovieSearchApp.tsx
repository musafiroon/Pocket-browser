
import React, { useState, useEffect } from 'react';
import { Film, Search, Star, Calendar, Tv, Loader2, Info, X } from 'lucide-react';
import { searchTmdb, getTmdbTrending, getImageUrl, getBackdropUrl } from '../../services/tmdbService';
import { TmdbItem } from '../../types';

const MovieSearchApp: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TmdbItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TmdbItem | null>(null);
    const [view, setView] = useState<'trending' | 'search'>('trending');

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        setIsLoading(true);
        try {
            const data = await getTmdbTrending('all', 'week');
            setResults(data.results);
            setView('trending');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setView('search');
        try {
            const data = await searchTmdb(query);
            // Filter out people to focus on content
            const filtered = data.results.filter(item => item.media_type !== 'person');
            setResults(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';

    return (
        <div className="flex flex-col h-full bg-[#0d253f] text-white font-sans overflow-hidden relative">
            
            {/* Header */}
            <div className="h-16 bg-[#01b4e4] flex items-center justify-between px-4 shadow-lg z-20 shrink-0">
                <div 
                    className="flex items-center gap-2 font-bold text-xl cursor-pointer"
                    onClick={() => { setQuery(''); loadTrending(); }}
                >
                    <Film size={24} className="text-white"/>
                    <span className="text-white">TMDB Search</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Find movies & TV..."
                            className="bg-[#0d253f] text-white rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-40 md:w-64 transition-all"
                        />
                        <button 
                            onClick={handleSearch}
                            className="absolute right-1 top-1 p-1 text-[#01b4e4] hover:text-white transition-colors"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                <h2 className="text-2xl font-bold mb-6 text-[#90cea1] flex items-center gap-2">
                    {view === 'trending' ? <TrendingTitle /> : `Results for "${query}"`}
                </h2>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-[#01b4e4]">
                        <Loader2 size={48} className="animate-spin mb-4"/>
                        <p>Fetching data from TMDB...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
                        {results.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="bg-[#103050] rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer group flex flex-col h-full border border-transparent hover:border-[#01b4e4]"
                            >
                                <div className="aspect-[2/3] relative bg-gray-800">
                                    {item.poster_path ? (
                                        <img 
                                            src={getImageUrl(item.poster_path)!} 
                                            alt={item.title || item.name} 
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                        <Star size={10} className="text-yellow-400 fill-yellow-400"/>
                                        {item.vote_average?.toFixed(1)}
                                    </div>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                                    </div>
                                </div>
                                <div className="p-3 flex flex-col flex-1">
                                    <h3 className="font-bold text-sm leading-tight mb-1">{item.title || item.name}</h3>
                                    <p className="text-xs text-[#90cea1] mt-auto">
                                        {getYear(item.release_date || item.first_air_date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="absolute inset-0 z-50 bg-[#0d253f]/95 backdrop-blur-md overflow-y-auto animate-fade-in">
                    <div className="relative min-h-full">
                        {/* Backdrop */}
                        <div className="h-64 md:h-96 w-full relative">
                            {selectedItem.backdrop_path ? (
                                <img 
                                    src={getBackdropUrl(selectedItem.backdrop_path)!} 
                                    className="w-full h-full object-cover opacity-40"
                                    alt="backdrop"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-b from-[#01b4e4] to-[#0d253f] opacity-20"/>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d253f] to-transparent"/>
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 md:px-12 -mt-32 relative flex flex-col md:flex-row gap-8 pb-12">
                            {/* Poster */}
                            <div className="w-48 md:w-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-[#103050] bg-gray-900 mx-auto md:mx-0">
                                {selectedItem.poster_path ? (
                                    <img 
                                        src={getImageUrl(selectedItem.poster_path)!} 
                                        className="w-full h-full object-cover"
                                        alt="poster"
                                    />
                                ) : (
                                    <div className="h-72 flex items-center justify-center text-gray-500">No Image</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 pt-4 text-center md:text-left">
                                <h1 className="text-3xl md:text-5xl font-bold mb-2">{selectedItem.title || selectedItem.name}</h1>
                                
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm md:text-base text-gray-300">
                                    <span className="flex items-center gap-1 bg-[#01b4e4] text-white px-3 py-1 rounded-full font-bold">
                                        <Star size={16} fill="white"/> {selectedItem.vote_average?.toFixed(1)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={16}/> {selectedItem.release_date || selectedItem.first_air_date || 'Unknown Date'}
                                    </span>
                                    <span className="uppercase tracking-wider font-bold text-[#90cea1] border border-[#90cea1] px-2 py-0.5 rounded">
                                        {selectedItem.media_type === 'tv' ? 'TV Series' : 'Movie'}
                                    </span>
                                </div>

                                <div className="bg-[#103050] p-6 rounded-xl border border-white/10 shadow-lg">
                                    <h3 className="text-[#01b4e4] font-bold uppercase tracking-wider mb-2 text-sm">Overview</h3>
                                    <p className="text-gray-300 leading-relaxed text-lg">
                                        {selectedItem.overview || "No overview available."}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="text-gray-400 text-sm font-mono bg-black/30 p-3 rounded w-fit mx-auto md:mx-0">
                                        TMDB ID: <span className="text-[#01b4e4] select-all">{selectedItem.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrendingTitle = () => (
    <div className="flex items-center gap-2">
        <span className="text-white">Trending</span>
        <span className="text-[#01b4e4]">This Week</span>
    </div>
);

export default MovieSearchApp;
