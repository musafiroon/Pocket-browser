
import React from 'react';

export interface IframePermissions {
    sandbox: {
        allowSameOrigin: boolean;
        allowScripts: boolean;
        allowForms: boolean;
        allowPopups: boolean;
        allowPopupsToEscapeSandbox: boolean;
        allowTopNavigation: boolean;
        allowTopNavigationByUserActivation: boolean;
        allowModals: boolean;
        allowPointerLock: boolean;
        allowPresentation: boolean;
        allowOrientationLock: boolean;
        allowDownloads: boolean;
    };
    allow: {
        accelerometer: boolean;
        ambientLightSensor: boolean;
        autoplay: boolean;
        battery: boolean;
        camera: boolean;
        displayCapture: boolean;
        encryptedMedia: boolean;
        fullscreen: boolean;
        geolocation: boolean;
        gyroscope: boolean;
        microphone: boolean;
        midi: boolean;
        payment: boolean;
        pictureInPicture: boolean;
        webShare: boolean;
        xrSpatialTracking: boolean;
    };
}

export interface Tab {
    id: number;
    title: string;
    url: string;
    isNewTab: boolean;
    permissions?: IframePermissions; // Custom permissions for this tab
}

export interface Favorite {
    id: string;
    title: string;
    url: string;
    icon: string;
    isDefault?: boolean;
}

export enum InternalApp {
    CALCULATOR = 'browser://calculator',
    AI_CHAT = 'browser://ai-chat',
    TEXT_UTILITY = 'browser://text-utility',
    SONGS = 'browser://songs'
}

// --- AI Types ---

export const AiModels = [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image Preview 🍌' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash Preview' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' },
    { id: 'gemini-2.5-flash-lite-preview', name: 'Gemini 2.5 Flash-Lite Preview' },
    { id: 'gemini-2.5-flash-native-audio-preview-09-2025', name: 'Gemini 2.5 Flash Native Audio' },
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image 🍌' },
    { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash Preview TTS' },
    { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro Preview TTS' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite' },
];

export interface AiSettings {
    model: string;
    systemInstruction: string;
    temperature: number;
    topK: number;
    topP: number;
    thinkingBudget: number; // For 2.5 models
    enableGrounding: boolean; // Google Search
    safetySettings: 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE';
    responseMimeType: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    image?: string;
    audioData?: string;
}

export interface TextUtilityAction {
    type: 'summarize' | 'keywords' | 'rewrite_professional' | 'rewrite_simple';
    label: string;
    icon: React.ElementType;
    color: string;
}

// --- Spotify Types ---

export interface SpotifyConfig {
    clientId: string;
    clientSecret: string;
}

export interface SpotifyImage {
    url: string;
    height?: number;
    width?: number;
}

export interface SpotifyArtist {
    id: string;
    name: string;
    images?: SpotifyImage[];
    uri: string;
    followers?: { total: number };
}

export interface SpotifyAlbum {
    name: string;
    images?: SpotifyImage[];
    release_date?: string;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists?: SpotifyArtist[];
    album?: SpotifyAlbum;
    uri: string;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    owner?: { display_name?: string };
    images?: SpotifyImage[];
    uri: string;
}

export interface SpotifySearchResults {
    artists: SpotifyArtist[];
    playlists: SpotifyPlaylist[];
    tracks?: SpotifyTrack[]; // Optional if we re-enable later
}
