import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Terminal, Calculator, Bot, TrendingUp, Music, Film, X } from 'lucide-react';
import { Favorite, InternalApp } from '../../types';

interface NewTabPageProps {
    onNavigate: (url: string, title?: string) => void;
}

const DEFAULT_FAVORITES: Favorite[] = [
    { id: 'ai', title: 'AI Chat', url: InternalApp.AI_CHAT, icon: 'AI_ICON', isDefault: true },
    { id: 'movies', title: 'Movies', url: InternalApp.MOVIE_SEARCH, icon: 'MOVIE_ICON', isDefault: true },
    { id: 'songs', title: 'Songs', url: InternalApp.SONGS, icon: 'SONGS_ICON', isDefault: true },
    { id: 'utility', title: 'Text Utils', url: InternalApp.TEXT_UTILITY, icon: 'UTILITY_ICON', isDefault: true },
    { id: 'calc', title: 'Calculator', url: InternalApp.CALCULATOR, icon: 'CALC_ICON', isDefault: true },
    { id: 'wiki', title: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico', isDefault: true },
];

const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate }) => {
    const [favorites, setFavorites] = useState<Favorite[]>(DEFAULT_FAVORITES);
    const [isEditing, setIsEditing] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    
    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('browser_favorites');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                const hydrated = parsed.map((f: Favorite) => ({
                    ...f,
                    isDefault: DEFAULT_FAVORITES.some(df => df.id === f.id)
                }));
                const missingDefaults = DEFAULT_FAVORITES.filter(df => !hydrated.some((hf: Favorite) => hf.id === df.id));
                setFavorites([...hydrated, ...missingDefaults]);
            } catch(e) {
                setFavorites(DEFAULT_FAVORITES);
            }
        } else {
            setFavorites(DEFAULT_FAVORITES);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('browser_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onNavigate(searchInput);
        }
    };

    const handleAddFavorite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        let finalUrl = newUrl.trim();
        // Simple protocol check
        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('browser://')) {
            finalUrl = 'https://' + finalUrl;
        }

        let domain = finalUrl;
        try {
            domain = new URL(finalUrl).hostname;
        } catch (e) {
            // fallback if invalid
        }

        const newFav: Favorite = {
            id: Date.now().toString(),
            title: newTitle.trim() || domain,
            url: finalUrl,
            icon: `https://www.google.com/s2/favicons?domain=${domain}`,
            isDefault: false
        };
        
        setFavorites([...favorites, newFav]);
        setShowAddModal(false);
        setNewTitle('');
        setNewUrl('');
    };

    const deleteFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavorites(favorites.filter(f => f.id !== id));
    };

    const loadEruda = () => {
        if (document.getElementById('eruda-loader')) {
            if ((window as any).eruda) (window as any).eruda.show();
            return;
        }
        const script = document.createElement('script');
        script.id = 'eruda-loader';
        script.src = "//cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js";
        script.onload = () => {
            if ((window as any).eruda) {
                (window as any).eruda.init();
                (window as any).eruda.show();
            }
        };
        document.body.appendChild(script);
    };

    const renderIcon = (fav: Favorite) => {
        if (fav.icon === 'AI_ICON') return <Bot className="text-blue-400" size={24} />;
        if (fav.icon === 'SONGS_ICON') return <Music className="text-pink-400" size={24} />;
        if (fav.icon === 'MOVIE_ICON') return <Film className="text-[#01b4e4]" size={24} />;
        if (fav.icon === 'UTILITY_ICON') return <TrendingUp className="text-emerald-400" size={24} />;
        if (fav.icon === 'CALC_ICON') return <Calculator className="text-purple-400" size={24} />;
        return <img src={fav.icon} alt={fav.title} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
    };

    return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center p-6 overflow-y-auto relative">
            <div className="max-w-3xl w-full flex flex-col items-center gap-10 mt-10 animate-fade-in">
                <h1 className="text-5xl font-light tracking-widest mb-4 text-blue-400 select-none">
                    pocket<span className="font-bold text-white">browser</span>
                </h1>

                {/* Search */}
                <div className="w-full relative group max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search the web or enter address..."
                        className="w-full bg-gray-800/80 backdrop-blur border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xl transition-all text-lg placeholder-gray-500"
                    />
                </div>

                {/* Controls */}
                <div className="flex gap-6 w-full justify-center md:justify-end border-b border-gray-800 pb-2">
                    <button onClick={loadEruda} className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors">
                        <Terminal size={14} /> Developer Console
                    </button>
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`text-xs flex items-center gap-1.5 transition-colors ${isEditing ? 'text-red-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Edit2 size={14} /> {isEditing ? 'Done Editing' : 'Edit Favorites'}
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-6 w-full">
                    {favorites.map(fav => (
                        <div 
                            key={fav.id}
                            className={`flex flex-col items-center gap-2 cursor-pointer group relative ${isEditing && fav.isDefault ? 'opacity-50' : ''}`}
                            onClick={() => !isEditing && onNavigate(fav.url, fav.title)}
                        >
                            {isEditing && !fav.isDefault && (
                                <button 
                                    onClick={(e) => deleteFavorite(e, fav.id)}
                                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 z-10 hover:bg-red-500 shadow-md transform hover:scale-110 transition-transform"
                                >
                                    <Trash2 size={12} className="text-white" />
                                </button>
                            )}
                            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center p-3 border border-gray-700 group-hover:border-blue-400 transition-all shadow-lg group-hover:shadow-blue-500/20 relative overflow-hidden">
                                {renderIcon(fav)}
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-white truncate max-w-[80px] text-center font-medium">{fav.title}</span>
                        </div>
                    ))}
                    
                    <div 
                        className="flex flex-col items-center gap-2 cursor-pointer group" 
                        onClick={() => setShowAddModal(true)}
                    >
                        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-700 group-hover:border-blue-400 text-gray-600 group-hover:text-white transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-white font-medium">Add New</span>
                    </div>
                </div>
            </div>

            {/* Add Favorite Modal */}
            {showAddModal && (
                <div className="absolute inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 w-full max-w-sm rounded-2xl border border-gray-700 shadow-2xl p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Add Favorite</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddFavorite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">URL</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="My Cool Site"
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)} 
                                    className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={!newUrl.trim()}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewTabPage;
