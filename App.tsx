import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Plus, X, Minimize2, Calculator as CalcIcon, Bot, TrendingUp, Layout, Music, Globe, Settings2, Film } from 'lucide-react';
import { Tab, InternalApp, IframePermissions } from './types';
import AiChat from './components/Apps/AiChat';
import TextUtility from './components/Apps/TextUtility';
import Calculator from './components/Apps/Calculator';
import SongsApp from './components/Apps/SongsApp';
import MovieSearchApp from './components/Apps/MovieSearchApp';
import NewTabPage from './components/NewTab/NewTabPage';
import CustomTabCreator from './components/NewTab/CustomTabCreator';
import CamouflageScreen from './components/Camouflage/CamouflageScreen';

const App: React.FC = () => {
    // --- State ---
    const [isLocked, setIsLocked] = useState(true); // Default to locked
    const [tabs, setTabs] = useState<Tab[]>([{ id: 1, title: 'New Tab', url: 'about:blank', isNewTab: true }]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [urlInput, setUrlInput] = useState('');
    const [showTabSwitcher, setShowTabSwitcher] = useState(false);
    const [showCustomTabCreator, setShowCustomTabCreator] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Locking Mechanism ---
    useEffect(() => {
        // Triggered when user switches tabs, minimizes, or phone screen turns off
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setIsLocked(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // --- Tab Logic ---
    useEffect(() => {
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab) {
            if (activeTab.isNewTab) setUrlInput('');
            else if (activeTab.url === InternalApp.CALCULATOR) setUrlInput('Calculator');
            else if (activeTab.url === InternalApp.AI_CHAT) setUrlInput('AI Chat');
            else if (activeTab.url === InternalApp.SONGS) setUrlInput('Spotify Connect');
            else if (activeTab.url === InternalApp.MOVIE_SEARCH) setUrlInput('TMDB Movies');
            else if (activeTab.url === InternalApp.TEXT_UTILITY) setUrlInput('Text Utility');
            else setUrlInput(activeTab.url);
        }
    }, [activeTabId, tabs]);

    useEffect(() => {
        const handleFS = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFS);
        return () => document.removeEventListener('fullscreenchange', handleFS);
    }, []);

    const createNewTab = (url = 'about:blank', isNewTab = true, title = 'New Tab') => {
        const newId = Date.now();
        const newTab = { id: newId, title, url, isNewTab };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newId);
        setShowTabSwitcher(false);
    };

    const createCustomTab = (url: string, title: string, permissions: IframePermissions) => {
        const newId = Date.now();
        const finalUrl = processUrl(url) || url;
        const newTab: Tab = {
            id: newId,
            title,
            url: finalUrl,
            isNewTab: false,
            permissions
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newId);
        setShowCustomTabCreator(false);
        setShowTabSwitcher(false);
    };

    const closeTab = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const remaining = tabs.filter(t => t.id !== id);
        if (remaining.length === 0) {
            setTabs([{ id: Date.now(), title: 'New Tab', url: 'about:blank', isNewTab: true }]);
            setActiveTabId(tabs[0].id);
        } else {
            setTabs(remaining);
            if (activeTabId === id) {
                setActiveTabId(remaining[remaining.length - 1].id);
            }
        }
    };

    const processUrl = (input: string): string | null => {
        let url = input.trim();
        if (!url) return null;
        const lower = url.toLowerCase();

        if (lower === 'calculator') return InternalApp.CALCULATOR;
        if (lower.includes('ai') && lower.includes('chat')) return InternalApp.AI_CHAT;
        if (lower.includes('utility')) return InternalApp.TEXT_UTILITY;
        if (lower === 'music' || lower === 'songs') return InternalApp.SONGS;
        if (lower === 'movies' || lower === 'tmdb' || lower === 'films') return InternalApp.MOVIE_SEARCH;

        if (url.startsWith('browser://')) return url;

        if (!url.includes('.') || url.includes(' ')) {
            return `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
        }
        if (!url.startsWith('http')) {
            return 'https://' + url;
        }
        return url;
    };

    const handleNavigate = (input: string, customTitle?: string) => {
        const finalUrl = processUrl(input);
        if (!finalUrl) return;

        let title = customTitle || finalUrl;
        if (finalUrl === InternalApp.CALCULATOR) title = 'Calculator';
        else if (finalUrl === InternalApp.AI_CHAT) title = 'AI Assistant';
        else if (finalUrl === InternalApp.SONGS) title = 'Spotify Connect';
        else if (finalUrl === InternalApp.MOVIE_SEARCH) title = 'TMDB Movies';
        else if (finalUrl === InternalApp.TEXT_UTILITY) title = 'Text Utils';

        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: finalUrl, title, isNewTab: false } : t));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    const getFavicon = (tab: Tab) => {
        if (tab.url === InternalApp.CALCULATOR) return <CalcIcon size={24} className="text-purple-400" />;
        if (tab.url === InternalApp.AI_CHAT) return <Bot size={24} className="text-blue-400" />;
        if (tab.url === InternalApp.SONGS) return <Music size={24} className="text-green-400" />;
        if (tab.url === InternalApp.MOVIE_SEARCH) return <Film size={24} className="text-[#01b4e4]" />;
        if (tab.url === InternalApp.TEXT_UTILITY) return <TrendingUp size={24} className="text-emerald-400" />;
        if (tab.isNewTab) return <Layout size={24} className="text-gray-400" />;
        return <Globe size={24} className="text-gray-400" />;
    };

    const getSandboxAttr = (perms?: IframePermissions) => {
        if (!perms) return "allow-same-origin allow-scripts allow-forms allow-popups allow-presentation";
        const arr = [];
        if (perms.sandbox.allowSameOrigin) arr.push('allow-same-origin');
        if (perms.sandbox.allowScripts) arr.push('allow-scripts');
        if (perms.sandbox.allowForms) arr.push('allow-forms');
        if (perms.sandbox.allowPopups) arr.push('allow-popups');
        if (perms.sandbox.allowPopupsToEscapeSandbox) arr.push('allow-popups-to-escape-sandbox');
        if (perms.sandbox.allowTopNavigation) arr.push('allow-top-navigation');
        if (perms.sandbox.allowTopNavigationByUserActivation) arr.push('allow-top-navigation-by-user-activation');
        if (perms.sandbox.allowModals) arr.push('allow-modals');
        if (perms.sandbox.allowPointerLock) arr.push('allow-pointer-lock');
        if (perms.sandbox.allowPresentation) arr.push('allow-presentation');
        if (perms.sandbox.allowOrientationLock) arr.push('allow-orientation-lock');
        if (perms.sandbox.allowDownloads) arr.push('allow-downloads');
        return arr.join(' ');
    };

    const getAllowAttr = (perms?: IframePermissions) => {
        if (!perms) return "fullscreen";
        const arr = [];
        if (perms.allow.accelerometer) arr.push('accelerometer');
        if (perms.allow.ambientLightSensor) arr.push('ambient-light-sensor');
        if (perms.allow.autoplay) arr.push('autoplay');
        if (perms.allow.battery) arr.push('battery');
        if (perms.allow.camera) arr.push('camera');
        if (perms.allow.displayCapture) arr.push('display-capture');
        if (perms.allow.encryptedMedia) arr.push('encrypted-media');
        if (perms.allow.fullscreen) arr.push('fullscreen');
        if (perms.allow.geolocation) arr.push('geolocation');
        if (perms.allow.gyroscope) arr.push('gyroscope');
        if (perms.allow.microphone) arr.push('microphone');
        if (perms.allow.midi) arr.push('midi');
        if (perms.allow.payment) arr.push('payment');
        if (perms.allow.pictureInPicture) arr.push('picture-in-picture');
        if (perms.allow.webShare) arr.push('web-share');
        if (perms.allow.xrSpatialTracking) arr.push('xr-spatial-tracking');
        return arr.join('; ');
    };

    return (
        <div ref={containerRef} className="flex h-[100dvh] w-full bg-gray-900 flex-col overflow-hidden font-sans relative">
            
            {/* Camouflage Overlay */}
            {isLocked && <CamouflageScreen onUnlock={() => setIsLocked(false)} />}

            {/* Fullscreen Exit */}
            {isFullscreen && (
                <button onClick={toggleFullscreen} className="absolute top-4 right-4 z-50 bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-800 shadow-lg flex items-center gap-2">
                    <Minimize2 size={16} /> Exit
                </button>
            )}

            {/* Custom Tab Creator Modal */}
            {showCustomTabCreator && (
                <CustomTabCreator 
                    onClose={() => setShowCustomTabCreator(false)}
                    onCreate={createCustomTab}
                />
            )}

            {/* Content Area */}
            <div className="flex-1 relative w-full overflow-hidden bg-white">
                {/* Tab Switcher Overlay */}
                {showTabSwitcher && (
                    <div className="absolute inset-0 bg-gray-900 z-40 p-6 overflow-y-auto animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Tabs</h2>
                            <div className="flex gap-3">
                                <button onClick={() => setShowTabSwitcher(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                                <button 
                                    onClick={() => setShowCustomTabCreator(true)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-500"
                                >
                                    <Settings2 size={18}/> Custom Tab
                                </button>
                                <button onClick={() => createNewTab()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-500"><Plus size={18} /> New</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
                            {tabs.map(tab => (
                                <div 
                                    key={tab.id}
                                    onClick={() => { setActiveTabId(tab.id); setShowTabSwitcher(false); }}
                                    className={`relative flex flex-col h-40 bg-gray-800 rounded-xl overflow-hidden border-2 cursor-pointer shadow-lg transition-transform active:scale-95 ${activeTabId === tab.id ? 'border-blue-500' : 'border-gray-700'}`}
                                >
                                    <div className="bg-gray-950 p-3 flex justify-between items-center border-b border-gray-700">
                                        <span className="truncate text-xs text-gray-300 font-medium">{tab.title}</span>
                                        <button onClick={(e) => closeTab(e, tab.id)} className="p-1 hover:bg-gray-700 rounded-full"><X size={14} className="text-gray-400" /></button>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center bg-gray-900">
                                        {getFavicon(tab)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Render Tabs */}
                {tabs.map(tab => {
                    const isActive = tab.id === activeTabId && !showTabSwitcher && !showCustomTabCreator;
                    return (
                        <div key={tab.id} className="w-full h-full bg-white absolute inset-0" style={{ display: isActive ? 'block' : 'none' }}>
                            {tab.url === InternalApp.CALCULATOR ? (
                                <Calculator />
                            ) : tab.url === InternalApp.AI_CHAT ? (
                                <AiChat />
                            ) : tab.url === InternalApp.SONGS ? (
                                <SongsApp />
                            ) : tab.url === InternalApp.MOVIE_SEARCH ? (
                                <MovieSearchApp />
                            ) : tab.url === InternalApp.TEXT_UTILITY ? (
                                <TextUtility />
                            ) : tab.isNewTab ? (
                                <NewTabPage onNavigate={(url, title) => handleNavigate(url, title)} />
                            ) : (
                                <iframe
                                    src={tab.url}
                                    className="w-full h-full border-none"
                                    title={`Tab ${tab.id}`}
                                    sandbox={getSandboxAttr(tab.permissions)}
                                    allow={getAllowAttr(tab.permissions)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Navigation Bar */}
            {!isFullscreen && !showCustomTabCreator && (
                <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-3 gap-3 z-40 shrink-0 shadow-lg">
                    <button 
                        className="w-10 h-10 rounded-lg hover:bg-gray-700 flex flex-col items-center justify-center gap-0.5 group"
                        onClick={() => setShowTabSwitcher(!showTabSwitcher)}
                    >
                        <span className="w-5 h-5 border-2 border-gray-400 group-hover:border-white rounded text-[10px] font-bold text-gray-400 group-hover:text-white flex items-center justify-center">
                            {tabs.length}
                        </span>
                    </button>

                    <div className="flex-1 flex items-center bg-gray-900 rounded-full border border-gray-600 px-2 h-10">
                        <button 
                            onClick={() => {
                                const el = document.querySelector('iframe');
                                if(el) try { el.contentWindow?.history.back(); } catch(e){}
                            }}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        
                        <input 
                            type="text" 
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNavigate(urlInput)}
                            placeholder="Search"
                            className="flex-1 bg-transparent border-none text-gray-200 text-sm focus:outline-none px-2 text-center"
                        />

                        <button 
                             onClick={() => setUrlInput('')}
                             className="p-2 text-gray-400 hover:text-white"
                        >
                             <RotateCcw size={14} />
                        </button>
                    </div>

                    <button onClick={() => createNewTab()} className="w-10 h-10 rounded-lg hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
                        <Plus size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;