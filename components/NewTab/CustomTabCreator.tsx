import React, { useState } from 'react';
import { X, Shield, CheckSquare, Square } from 'lucide-react';
import { IframePermissions } from '../../types';

interface Props {
    onClose: () => void;
    onCreate: (url: string, title: string, permissions: IframePermissions) => void;
}

const DEFAULT_PERMISSIONS: IframePermissions = {
    sandbox: {
        allowSameOrigin: true,
        allowScripts: true,
        allowForms: true,
        allowPopups: false,
        allowPopupsToEscapeSandbox: false,
        allowTopNavigation: false,
        allowTopNavigationByUserActivation: false,
        allowModals: false,
        allowPointerLock: false,
        allowPresentation: true,
        allowOrientationLock: false,
        allowDownloads: false,
    },
    allow: {
        accelerometer: false,
        ambientLightSensor: false,
        autoplay: true,
        battery: false,
        camera: false,
        displayCapture: false,
        encryptedMedia: true,
        fullscreen: true,
        geolocation: false,
        gyroscope: false,
        microphone: false,
        midi: false,
        payment: false,
        pictureInPicture: true,
        webShare: false,
        xrSpatialTracking: false,
    }
};

const CustomTabCreator: React.FC<Props> = ({ onClose, onCreate }) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [perms, setPerms] = useState<IframePermissions>(DEFAULT_PERMISSIONS);
    const [activeTab, setActiveTab] = useState<'sandbox' | 'features'>('sandbox');

    const toggleSandbox = (key: keyof IframePermissions['sandbox']) => {
        setPerms(prev => ({
            ...prev,
            sandbox: { ...prev.sandbox, [key]: !prev.sandbox[key] }
        }));
    };

    const toggleFeature = (key: keyof IframePermissions['allow']) => {
        setPerms(prev => ({
            ...prev,
            allow: { ...prev.allow, [key]: !prev.allow[key] }
        }));
    };

    const handleCreate = () => {
        if (!url) return;
        onCreate(url, title || url, perms);
    };

    return (
        <div className="absolute inset-0 bg-gray-900/95 backdrop-blur z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-blue-400"/> Custom Tab</h2>
                        <p className="text-gray-400 text-sm">Configure granular security and feature policies.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><X/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Basic Info Sidebar */}
                    <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-700 bg-gray-800/50">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Target URL</label>
                                <input 
                                    type="text" 
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Tab Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="My Custom App"
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50 text-xs text-blue-200">
                                Warning: Relaxing sandbox restrictions can expose your browser to security risks from malicious sites.
                            </div>
                        </div>
                    </div>

                    {/* Permissions Config */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-gray-700">
                            <button 
                                onClick={() => setActiveTab('sandbox')}
                                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'sandbox' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Sandbox Restrictions
                            </button>
                            <button 
                                onClick={() => setActiveTab('features')}
                                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'features' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Feature Policy
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeTab === 'sandbox' ? (
                                    Object.keys(perms.sandbox).map(key => (
                                        <div 
                                            key={key} 
                                            onClick={() => toggleSandbox(key as any)}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                ${perms.sandbox[key as keyof typeof perms.sandbox] ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}
                                            `}
                                        >
                                            {perms.sandbox[key as keyof typeof perms.sandbox] ? <CheckSquare size={18} className="text-blue-400"/> : <Square size={18} className="text-gray-600"/>}
                                            <span className="text-sm text-gray-200 font-mono">{key.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
                                        </div>
                                    ))
                                ) : (
                                    Object.keys(perms.allow).map(key => (
                                        <div 
                                            key={key} 
                                            onClick={() => toggleFeature(key as any)}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                ${perms.allow[key as keyof typeof perms.allow] ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}
                                            `}
                                        >
                                            {perms.allow[key as keyof typeof perms.allow] ? <CheckSquare size={18} className="text-green-400"/> : <Square size={18} className="text-gray-600"/>}
                                            <span className="text-sm text-gray-200 font-mono">{key.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">Cancel</button>
                    <button 
                        onClick={handleCreate}
                        disabled={!url}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                    >
                        Launch Tab
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomTabCreator;
