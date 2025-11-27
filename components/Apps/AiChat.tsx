import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Image as ImageIcon, Mic, Loader2, Volume2, Settings, X, Search as SearchIcon, Globe } from 'lucide-react';
import { generateGeminiContent, playBase64Audio } from '../../services/geminiService';
import { AiModels, AiSettings, ChatMessage } from '../../types';

const DEFAULT_SETTINGS: AiSettings = {
    model: 'gemini-2.5-flash',
    systemInstruction: 'You are a helpful, advanced AI assistant.',
    temperature: 1.0,
    topK: 64,
    topP: 0.95,
    thinkingBudget: 0,
    enableGrounding: false,
    safetySettings: 'BLOCK_NONE',
    responseMimeType: 'text/plain',
};

const AiChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: "Hello! Configure your settings and start chatting." }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load settings from local storage
    useEffect(() => {
        const saved = localStorage.getItem('ai_chat_settings');
        if (saved) {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
        }
    }, []);

    // Save settings
    const handleSaveSettings = () => {
        localStorage.setItem('ai_chat_settings', JSON.stringify(settings));
        setShowSettings(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setSelectedImage(base64.split(',')[1]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsg: ChatMessage = { 
            role: 'user', 
            text: input, 
            image: selectedImage ? selectedImage : undefined 
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        const tempImage = selectedImage;
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const response = await generateGeminiContent(
                settings,
                userMsg.text || "Describe this image",
                messages,
                tempImage || undefined
            );

            const aiMsg: ChatMessage = {
                role: 'model',
                text: response.text,
                audioData: response.audioData
            };
            
            setMessages(prev => [...prev, aiMsg]);
            
            if (response.groundingMetadata && response.groundingMetadata.groundingChunks) {
                // Grounding debug/display logic could go here
                // For now, we rely on the text including the links or citations
            }

            if (response.audioData) {
                await playBase64Audio(response.audioData);
            }

        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full bg-gray-900 text-white relative overflow-hidden">
            
            {/* Settings Sidebar / Modal */}
            <div className={`
                absolute inset-y-0 right-0 w-full md:w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${showSettings ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Settings size={20}/> Configuration</h2>
                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-700 rounded-full"><X size={20}/></button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Model</label>
                            <select 
                                value={settings.model} 
                                onChange={e => setSettings({...settings, model: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm"
                            >
                                {AiModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">System Instructions</label>
                            <textarea 
                                value={settings.systemInstruction}
                                onChange={e => setSettings({...settings, systemInstruction: e.target.value})}
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Temperature ({settings.temperature})</label>
                                <input 
                                    type="range" min="0" max="2" step="0.1" 
                                    value={settings.temperature} 
                                    onChange={e => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Thinking Budget</label>
                                <input 
                                    type="number" 
                                    value={settings.thinkingBudget} 
                                    onChange={e => setSettings({...settings, thinkingBudget: parseInt(e.target.value)})}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm"
                                    placeholder="0 (Disabled)"
                                />
                            </div>
                        </div>

                         <div className="flex items-center gap-3 bg-gray-900 p-3 rounded border border-gray-600">
                             <input 
                                type="checkbox" 
                                id="grounding"
                                checked={settings.enableGrounding}
                                onChange={e => setSettings({...settings, enableGrounding: e.target.checked})}
                             />
                             <label htmlFor="grounding" className="text-sm font-medium flex items-center gap-2">
                                 <Globe size={14} className="text-blue-400"/> Enable Google Search Grounding
                             </label>
                         </div>

                        <div>
                             <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Safety Settings</label>
                             <select 
                                value={settings.safetySettings}
                                onChange={e => setSettings({...settings, safetySettings: e.target.value as any})}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm"
                             >
                                 <option value="BLOCK_NONE">None (Most Open)</option>
                                 <option value="BLOCK_ONLY_HIGH">Block Only High</option>
                                 <option value="BLOCK_MEDIUM_AND_ABOVE">Block Medium+</option>
                                 <option value="BLOCK_LOW_AND_ABOVE">Block Low+</option>
                             </select>
                        </div>

                        <button onClick={handleSaveSettings} className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-500">
                            Save & Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Bot className="text-blue-400"/>
                        <span className="font-bold hidden md:inline">Gemini AI</span>
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300 truncate max-w-[150px]">{settings.model}</span>
                    </div>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white">
                        <Settings size={20}/>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}>
                                {msg.image && (
                                    <img src={`data:image/jpeg;base64,${msg.image}`} className="max-w-full rounded mb-2 h-auto" alt="User upload" />
                                )}
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                {msg.audioData && (
                                    <button onClick={() => playBase64Audio(msg.audioData!)} className="mt-2 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-xs">
                                        <Volume2 size={14} className="text-blue-400"/> Replay
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                                <span className="text-xs text-gray-400">Gemini is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Input */}
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <div className="flex gap-2 items-end">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
                        
                        <div className="flex-1 flex flex-col gap-2">
                            {selectedImage && (
                                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded w-fit">
                                    <ImageIcon size={14} className="text-green-400"/>
                                    <span className="text-xs text-gray-300">Image attached</span>
                                    <button onClick={() => setSelectedImage(null)}><X size={14}/></button>
                                </div>
                            )}
                            <input 
                                type="text" 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Message..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                        </div>

                        <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300">
                            <ImageIcon size={20}/>
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                            className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                        >
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiChat;