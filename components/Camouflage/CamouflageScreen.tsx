import React, { useState } from 'react';

interface Props {
    onUnlock: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const CamouflageScreen: React.FC<Props> = ({ onUnlock }) => {
    const [sequence, setSequence] = useState<Direction[]>([]);
    const [showAuth, setShowAuth] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    
    // U U D D L R L R
    const TARGET_SEQUENCE: Direction[] = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT'];

    const handlePointerDown = (e: React.PointerEvent) => {
        if (showAuth) return;

        // Visual feedback prevention for non-inputs
        if (e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
             e.preventDefault();
        }

        const clientX = e.clientX;
        const clientY = e.clientY;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let dir: Direction;

        // X-shape quadrant logic
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'RIGHT' : 'LEFT';
        } else {
            dir = dy > 0 ? 'DOWN' : 'UP';
        }

        setSequence(prev => {
            const newSeq = [...prev, dir];
            if (newSeq.length > TARGET_SEQUENCE.length) {
                newSeq.shift();
            }
            
            const isMatch = newSeq.length === TARGET_SEQUENCE.length && 
                            newSeq.every((val, index) => val === TARGET_SEQUENCE[index]);
            
            if (isMatch) {
                setShowAuth(true);
            }
            
            return newSeq;
        });
    };

    const handleAuthSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (code.toUpperCase() === 'BA') {
            onUnlock();
            setSequence([]);
            setShowAuth(false);
            setCode('');
        } else {
            setError(true);
            setCode('');
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[9999] bg-white text-[#171a1d] flex items-center justify-center p-4 cursor-default select-none touch-none overflow-y-auto"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' }}
            onPointerDown={handlePointerDown}
        >
            {/* Main Card Container */}
            <div className="w-full max-w-[460px] bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.1)] p-6 sm:p-8 pointer-events-auto">
                
                {/* Header Section */}
                <h1 className="text-[28px] font-bold leading-tight mb-4 text-gray-900">
                    Site not found
                </h1>
                
                <p className="text-[17px] leading-relaxed text-gray-700 mb-6">
                    Looks like you followed a broken link or entered a URL that doesn’t exist on Netlify.
                </p>

                {/* Divider */}
                <hr className="border-t border-gray-100 mb-6" />

                {/* Support Info Section */}
                <p className="text-[15px] leading-relaxed text-gray-600 mb-5">
                    If this is your site, and you weren’t expecting a 404 for this path, please visit Netlify’s <span className="text-[#20968b] underline decoration-1 underline-offset-2 hover:text-[#1a7a71] font-medium cursor-pointer">“page not found” support guide</span> for troubleshooting tips.
                </p>

                {/* Internal ID Section */}
                <div className="mt-6">
                    <p className="text-[13px] text-gray-500 mb-2">
                        Netlify Internal ID:
                    </p>
                    <div className="bg-gray-100 rounded p-3 text-[13px] font-mono text-gray-600 break-all">
                        01KBACCWKM5JZQCJ0Q8SP16VNX
                    </div>
                </div>

            </div>

            {/* Auth Modal (Hidden Overlay) */}
            {showAuth && (
                <div 
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 cursor-auto"
                    onPointerDown={(e) => e.stopPropagation()} 
                >
                    <form onSubmit={handleAuthSubmit} className="bg-white shadow-2xl p-8 rounded-xl border border-gray-200 w-80 animate-fade-in">
                        <h3 className="text-lg font-bold mb-4 text-center text-gray-800">System Access</h3>
                        <input 
                            autoFocus
                            type="text" 
                            className={`w-full border-2 rounded-lg p-3 text-center text-xl tracking-widest uppercase outline-none transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#20968b]'}`}
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="CODE"
                        />
                    </form>
                </div>
            )}
        </div>
    );
};

export default CamouflageScreen;