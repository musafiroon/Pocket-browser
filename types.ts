
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
    MOVIE_SEARCH = 'browser://movies'
}

// --- TMDB Types ---

export interface TmdbItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person';
    title?: string;
    name?: string; // TV shows use 'name' instead of 'title'
    poster_path?: string;
    backdrop_path?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    popularity?: number;
}

export interface TmdbResponse {
    page: number;
    results: TmdbItem[];
    total_pages: number;
    total_results: number;
}
