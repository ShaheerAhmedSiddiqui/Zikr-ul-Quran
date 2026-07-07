import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { PlaylistWithItems, Surah } from '../types';
import '../style/PlaylistView.css';

// Define a simplified interface for audio player
interface AudioPlaylistItem {
    surah: Surah;
    language: string;
}

const PlaylistView: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get audio player context with play/pause functions
    const {
        playSurahFromPlaylist,
        pauseAudio,
        resumeAudio,
        currentSurah,
        isPlaying,
        currentLanguage: contextLanguage
    } = useAudioPlayer();

    const [playlist, setPlaylist] = useState<PlaylistWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlaylist = useCallback(async () => {
        // Don't fetch if user is not logged in
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('🎵 Fetching playlist details for:', playlistId);

            const response = await playlistAPI.getPlaylistById(parseInt(playlistId!), user!.userId);
            console.log('📦 Playlist response:', response.data);

            let playlistData: any;

            if (response.data) {
                playlistData = response.data;
            } else {
                throw new Error('Invalid playlist data format');
            }

            // Process items to ensure proper structure
            const items = Array.isArray(playlistData.items) ? playlistData.items : [];
            const processedItems = items.map((item: any) => ({
                itemId: Number(item.itemId || 0),
                playlistId: Number(playlistData.playlistId),
                surah: {
                    surahId: Number(item.surahId || item.surah?.surahId || 0),
                    surahNameEn: String(item.surahName || item.surah?.surahNameEn || `Surah ${item.surahId || item.surah?.surahId || 'Unknown'}`)
                },
                language: String(item.language || 'arabic'),
                position: Number(item.position || 0)
            }));

            const typedPlaylist: PlaylistWithItems = {
                playlistId: Number(playlistData.playlistId),
                playlistName: String(playlistData.playlistName),
                userId: Number(playlistData.userId),
                itemCount: Number(playlistData.itemCount || processedItems.length),
                items: processedItems
            };

            console.log('✅ Processed playlist with items:', processedItems);
            setPlaylist(typedPlaylist);
        } catch (err: any) {
            console.error('Error fetching playlist:', err);
            setError('Failed to load playlist');
        } finally {
            setLoading(false);
        }
    }, [playlistId, user]);

    useEffect(() => {
        if (playlistId && user) {
            fetchPlaylist().catch(console.error);
        } else if (!user) {
            setLoading(false);
        }
    }, [playlistId, user, fetchPlaylist]);

    const removeFromPlaylist = async (surahId: number, language: string) => {
        if (!playlist || !user) return;

        try {
            await playlistAPI.removeSurah(playlist.playlistId, surahId, user.userId, language);
            fetchPlaylist().catch(console.error);
        } catch (err) {
            console.error('Error removing surah from playlist:', err);
            alert('Failed to remove surah from playlist');
        }
    };

    const handlePlayPauseSurah = (surah: Surah, language: string) => {
        if (!playlist) return;

        // If this surah is currently playing, toggle pause/resume
        if (currentSurah?.surahId === surah.surahId && contextLanguage === language) {
            if (isPlaying) {
                pauseAudio();
                console.log('⏸️ Pausing current surah from playlist');
            } else {
                resumeAudio();
                console.log('▶️ Resuming current surah from playlist');
            }
        } else {
            // If it's a different surah or language, start playing it
            console.log('▶️ Playing surah from playlist:', surah.surahNameEn, 'in stored language:', language);

            // Convert playlist items to the simplified format expected by playSurahFromPlaylist
            const playlistItems: AudioPlaylistItem[] = playlist.items.map(item => ({
                surah: item.surah,
                language: item.language
            }));

            // Use the new method that respects stored languages
            playSurahFromPlaylist(surah, language, playlistItems);
        }
    };

    // Helper function to check if a surah is currently playing
    const isSurahPlaying = (surahId: number, language: string): boolean => {
        return currentSurah?.surahId === surahId &&
            contextLanguage === language &&
            isPlaying;
    };

    const getLanguageDisplayName = (language: string) => {
        switch (language) {
            case 'arabic': return 'Arabic';
            case 'english': return 'English';
            case 'urdu': return 'Urdu';
            default: return language;
        }
    };

    // Show login prompt when user is not logged in
    if (!user) {
        return (
            <div className="playlist-view-container">
                <div className="login-prompt">
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your playlists</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="login-btn"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="playlist-view-container">
                <div className="loading">Loading playlist...</div>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="playlist-view-container">
                <div className="error">{error || 'Playlist not found'}</div>
                <button onClick={() => navigate('/playlists')} className="back-btn">
                    Back to Playlists
                </button>
            </div>
        );
    }

    return (
        <div className="playlist-view-container">
            <div className="playlist-header">
                <button onClick={() => navigate('/playlists')} className="back-btn">
                    ← Back to Playlists
                </button>
                <h1 className="playlist-title">{playlist.playlistName}</h1>
                <p className="playlist-info">
                    {playlist.itemCount} surah{playlist.itemCount !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="playlist-items">
                {playlist.items.length === 0 ? (
                    <div className="empty-playlist">
                        <p>No surahs in this playlist yet</p>
                        <button
                            onClick={() => navigate('/browse')}
                            className="browse-btn"
                        >
                            Browse Surahs
                        </button>
                    </div>
                ) : (
                    playlist.items.map((item: any, index: number) => (
                        <div key={item.itemId || index} className="playlist-item">
                            <div className="item-number">{index + 1}</div>
                            <div className="item-details">
                                <h3 className="surah-name">
                                    {item.surah?.surahNameEn || `Surah ${item.surah?.surahId || 'Unknown'}`}
                                </h3>
                                <div className="item-meta">
                                    <span className="surah-id">Surah {item.surah?.surahId || 'Unknown' }  </span>
                                    <span className="language-badge">{getLanguageDisplayName(item.language)}</span>
                                </div>
                                {isSurahPlaying(item.surah?.surahId, item.language) && (
                                    <div className="now-playing-indicator">
                                        Now Playing
                                    </div>
                                )}
                            </div>
                            <div className="item-actions">
                                <button
                                    className={`play-btn ${isSurahPlaying(item.surah?.surahId, item.language) ? 'playing' : ''}`}
                                    onClick={() => handlePlayPauseSurah(item.surah, item.language)}
                                    title={`${isSurahPlaying(item.surah?.surahId, item.language) ? 'Pause' : 'Play'} ${item.surah?.surahNameEn} in ${getLanguageDisplayName(item.language)}`}
                                >
                                    {isSurahPlaying(item.surah?.surahId, item.language) ? '❚❚' : '▶'}
                                </button>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromPlaylist(item.surah?.surahId, item.language)}
                                    title="Remove from Playlist"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlaylistView;