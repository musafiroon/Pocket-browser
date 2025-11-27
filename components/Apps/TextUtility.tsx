import React, { useState } from 'react';
import { TrendingUp, Zap, Brain, Star, Loader2, AlertCircle } from 'lucide-react';
import { generateGeminiContent } from '../../services/geminiService';
import { AiSettings, TextUtilityAction } from '../../types';

const TextUtility: React.FC = () => {
    const [sourceText, setSourceText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (actionType: string) => {
        if (!sourceText.trim()) {
            setError("Please enter text to process.");
            return;
        }
        setError(null);
        setIsLoading(true);
        setOutputText('');

        const settings: AiSettings = {
            model: 'gemini-2.5-flash',
            systemInstruction: 'You are a helpful text processing assistant.',
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            thinkingBudget: 0,
            enableGrounding: false,
            safetySettings: 'BLOCK_NONE',
            responseMimeType: 'text/plain'
        };

        const promptMap: Record<string, string> = {
            summarize: "Summarize the following text in one concise paragraph:",
            keywords: "Extract top 10 keywords from this text as a comma-separated list:",
            rewrite_professional: "Rewrite the following text to be professional and articulate:",
            rewrite_simple: "Rewrite the following text to be simple and easy to understand for a child:"
        };

        const instruction = promptMap[actionType];
        const fullPrompt = `${instruction}\n\n"${sourceText}"`;

        try {
            const result = await generateGeminiContent(settings, fullPrompt);
            setOutputText(result.text);
        } catch (err: any) {
            setError(`Processing error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const buttons: TextUtilityAction[] = [
        { type: 'summarize', label: 'Summarize', icon: TrendingUp, color: 'blue' },
        { type: 'keywords', label: 'Keywords', icon: Zap, color: 'purple' },
        { type: 'rewrite_professional', label: 'Professional', icon: Brain, color: 'emerald' },
        { type: 'rewrite_simple', label: 'Simplify', icon: Star, color: 'amber' },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 p-6 overflow-hidden">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <TrendingUp size={24} /> Text Studio
            </h2>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden pb-4">
                <div className="flex flex-col h-full">
                    <label className="text-sm font-semibold mb-2 text-gray-300">Input</label>
                    <textarea
                        value={sourceText}
                        onChange={(e) => {setSourceText(e.target.value); setError(null);}}
                        placeholder="Paste text here..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none scrollbar-hide"
                    />
                </div>
                <div className="flex flex-col h-full">
                    <label className="text-sm font-semibold mb-2 text-gray-300">Output</label>
                    <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-200 overflow-y-auto scrollbar-hide">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-blue-400">
                                <Loader2 size={24} className="animate-spin mr-2" /> Processing...
                            </div>
                        ) : outputText ? (
                            <div className="whitespace-pre-wrap leading-relaxed">{outputText}</div>
                        ) : error ? (
                            <div className="text-red-400 flex items-center gap-2"><AlertCircle size={20} /> {error}</div>
                        ) : (
                            <p className="text-gray-500 italic">Result will appear here.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3 justify-center pt-2">
                {buttons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => handleAction(btn.type)}
                        disabled={isLoading || !sourceText.trim()}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 bg-${btn.color}-600 text-white hover:bg-${btn.color}-500`}
                    >
                        <btn.icon size={16} /> {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TextUtility;