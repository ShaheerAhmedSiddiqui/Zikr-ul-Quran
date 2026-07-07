// Centralized types to avoid conflicts - UPDATED VERSION

export interface Surah {
    surahId: number;
    surahNameEn: string;
    surahNameAr?: string;
    revelationType?: string;
}

// Simple Playlist interface without items to avoid conflicts
export interface SimplePlaylist {
    playlistId: number;
    playlistName: string;
    userId: number;
    itemCount: number; // Ensure this is included
}

// Full Playlist interface for when you need items
export interface PlaylistWithItems {
    playlistId: number;
    playlistName: string;
    userId: number;
    itemCount: number; // Ensure this is included
    items: PlaylistItem[];
}

export interface PlaylistItem {
    itemId: number;
    playlistId: number;
    surah: Surah;
    language: string;
    position: number;
}

export interface User {
    userId: number;
    username: string;
    email: string;
}