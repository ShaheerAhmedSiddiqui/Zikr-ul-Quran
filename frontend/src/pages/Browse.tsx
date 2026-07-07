import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { surahAPI, playlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useLanguage } from '../context/LanguageContext';
import { Surah, SimplePlaylist, PlaylistItem } from '../types';
import '../style/Browse.css';
import makkiImage from '../assets/makka (1).png';
import madaniImage from '../assets/madina.png';

// Extended interface for playlists with items
interface PlaylistWithItems extends SimplePlaylist {
    items: Array<{
        surahId: number;
        surah?: { surahId: number };
        language?: string;
    }>;
    itemCount: number;
}

const Browse: React.FC = () => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [filter, setFilter] = useState<'all' | 'makki' | 'madani'>('all');
    const [sortBy, setSortBy] = useState<'surahId' | 'name'>('surahId');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Remove local playingSurah state and use the context instead
    const [playlists, setPlaylists] = useState<PlaylistWithItems[]>([]);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [addingToPlaylist, setAddingToPlaylist] = useState(false);

    const { user } = useAuth();
    const {
        playSurah,
        pauseAudio,
        resumeAudio,
        currentSurah,
        isPlaying,
        currentLanguage: contextLanguage
    } = useAudioPlayer(); // Get the audio player context
    const { selectedLanguage, setSelectedLanguage } = useLanguage();

    const fetchSurahs = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching all surahs from backend...');

            const response = await surahAPI.getAll();
            console.log('Browse surahs response:', response.data);

            let surahsData: Surah[] = [];

            if (Array.isArray(response.data)) {
                surahsData = response.data;
            }
            else if (response.data && Array.isArray(response.data.data)) {
                surahsData = response.data.data;
            }
            else if (response.data?.data && Array.isArray(response.data.data)) {
                surahsData = response.data.data;
            }
            else {
                throw new Error('Invalid response format from server');
            }

            setSurahs(surahsData);
        } catch (err: any) {
            console.error('Error fetching surahs:', err);
            setError('Failed to load surahs. Please try again later.');
            setSurahs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPlaylists = useCallback(async () => {
        if (!user) return;

        try {
            console.log('🎵 Fetching user playlists for user:', user.userId);
            const response = await playlistAPI.getUserPlaylists(user.userId);

            let playlistsData: any[] = [];

            if (Array.isArray(response.data)) {
                playlistsData = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                playlistsData = response.data.data;
            } else {
                playlistsData = [];
            }

            const playlistsWithItems: PlaylistWithItems[] = playlistsData.map((playlist: any) => ({
                playlistId: Number(playlist.playlistId),
                playlistName: String(playlist.playlistName),
                userId: Number(playlist.userId),
                itemCount: Number(playlist.itemCount || 0),
                items: Array.isArray(playlist.items) ? playlist.items : []
            }));

            setPlaylists(playlistsWithItems);
            console.log('✅ User playlists:', playlistsWithItems);
        } catch (err) {
            console.error('❌ Error fetching playlists:', err);
            setPlaylists([]);
        }
    }, [user]);

    useEffect(() => {
        fetchSurahs();
        if (user) {
            fetchUserPlaylists();
        }
    }, [user, fetchUserPlaylists]);

    const getSurahType = (surahId: number): 'makki' | 'madani' => {
        return surahId <= 86 ? 'makki' : 'madani';
    };

    const addToPlaylist = async (playlistId: number, surah: Surah) => {
        if (!user) {
            alert('Please login to add surahs to playlists');
            return;
        }

        try {
            setAddingToPlaylist(true);
            console.log('➕ Adding surah to playlist:', {
                playlistId,
                surahId: surah.surahId,
                surahName: surah.surahNameEn,
                selectedLanguage
            });

            // Check if surah with same language already exists in playlist
            const playlist = playlists.find(p => p.playlistId === playlistId);
            if (playlist?.items?.some((item) =>
                item.surahId === surah.surahId && item.language === selectedLanguage)) {
                alert(`❌ "${surah.surahNameEn}" in ${selectedLanguage} is already in this playlist!`);
                return;
            }

            // Pass the selected language when adding to playlist
            const response = await playlistAPI.addSurah(playlistId, surah.surahId, user.userId, selectedLanguage);
            console.log('✅ Surah added to playlist:', response.data);

            alert(`✅ "${surah.surahNameEn}" in ${selectedLanguage} added to "${playlist?.playlistName}" successfully!`);

            setShowPlaylistModal(false);
            setSelectedSurah(null);

            // Refresh playlists to show updated count
            fetchUserPlaylists();
        } catch (err: any) {
            console.error('❌ Error adding surah to playlist:', err);
            const errorMessage = err.response?.data?.message || 'Failed to add surah to playlist. Please try again.';
            alert(`❌ ${errorMessage}`);
        } finally {
            setAddingToPlaylist(false);
        }
    };

    const openPlaylistModal = (surah: Surah) => {
        if (!user) {
            alert('Please login to add surahs to playlists');
            return;
        }

        fetchUserPlaylists();
        setSelectedSurah(surah);
        setShowPlaylistModal(true);
    };

    const handlePlayPauseSurah = (surah: Surah) => {
        try {
            // If this surah is currently playing, toggle pause/resume
            if (currentSurah?.surahId === surah.surahId && contextLanguage === selectedLanguage) {
                if (isPlaying) {
                    pauseAudio();
                    console.log('⏸️ Pausing current surah');
                } else {
                    resumeAudio();
                    console.log('▶️ Resuming current surah');
                }
            } else {
                // If it's a different surah or language, start playing it
                console.log('🎵 Starting new surah:', {
                    surah: surah.surahNameEn,
                    language: selectedLanguage
                });

                // Play the surah using context - pass the selected language
                playSurah(surah, surahs, selectedLanguage);
            }
        } catch (err) {
            console.error('Error handling surah playback:', err);
            setError(`Cannot play ${surah.surahNameEn}. Please try again.`);
        }
    };

    const handleLanguageChange = (newLanguage: string) => {
        console.log('🌐 Language changed to:', newLanguage);
        setSelectedLanguage(newLanguage);
    };

    // Helper function to check if a surah is currently playing
    const isSurahPlaying = (surahId: number): boolean => {
        return currentSurah?.surahId === surahId &&
            contextLanguage === selectedLanguage &&
            isPlaying;
    };

    const filteredSurahs = surahs
        .filter(surah => {
            if (filter === 'all') return true;
            return getSurahType(surah.surahId) === filter;
        })
        .sort((a, b) => {
            if (sortBy === 'surahId') return a.surahId - b.surahId;
            return a.surahNameEn.localeCompare(b.surahNameEn);
        });

    if (loading) {
        return (
            <div className="browse-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading all surahs...</p>
                </div>
            </div>
        );
    }

    if (error && surahs.length === 0) {
        return (
            <div className="browse-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Unable to Load Surahs</h3>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={fetchSurahs}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="browse-container">
            <div className="browse-header">
                <h1 className="page-title">All Surahs</h1>
                <p className="page-subtitle">
                    Browse through all 114 surahs of the Holy Quran
                </p>
            </div>

            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="dismiss-btn">×</button>
                </div>
            )}

            <div className="browse-controls">
                <div className="filter-group">
                    <span className="filter-label">Filter by:</span>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'makki' ? 'active' : ''}`}
                            onClick={() => setFilter('makki')}
                        >
                            Makki
                        </button>
                        <button
                            className={`filter-btn ${filter === 'madani' ? 'active' : ''}`}
                            onClick={() => setFilter('madani')}
                        >
                            Madani
                        </button>
                    </div>
                </div>

                <div className="language-group">
                    <span className="language-label">Language:</span>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="language-dropdown"
                    >
                        <option value="arabic">Arabic Recitation</option>
                        <option value="english">English Translation</option>
                        <option value="urdu">Urdu Translation</option>
                    </select>
                </div>

                <div className="sort-group">
                    <span className="sort-label">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'surahId' | 'name')}
                        className="sort-select"
                    >
                        <option value="surahId">Surah Number</option>
                        <option value="name">Name</option>
                    </select>
                </div>
            </div>

            <div className="surahs-grid">
                {filteredSurahs.length > 0 ? (
                    filteredSurahs.map((surah) => (
                        <div key={surah.surahId} className="surah-card">
                            <div className="card-header">
                                <div className="surah-number">{surah.surahId}</div>
                                <div className={`surah-type ${getSurahType(surah.surahId)}`}>
                                    <img
                                        src={getSurahType(surah.surahId) === 'makki' ? makkiImage : madaniImage}
                                        alt={getSurahType(surah.surahId).toUpperCase()}
                                        className="surah-type-image"
                                    />
                                </div>
                            </div>

                            <div className="card-body">
                                <h3 className="surah-name">{surah.surahNameEn}</h3>
                                <p className="current-language">Language: {selectedLanguage}</p>
                                {isSurahPlaying(surah.surahId) && (
                                    <div className="now-playing-indicator">
                                        Now Playing
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button
                                    className={`play-btn ${isSurahPlaying(surah.surahId) ? 'playing' : ''}`}
                                    onClick={() => handlePlayPauseSurah(surah)}
                                    title={`${isSurahPlaying(surah.surahId) ? 'Pause' : 'Play'} ${surah.surahNameEn} in ${selectedLanguage}`}
                                >
                                    {isSurahPlaying(surah.surahId) ? '❚❚' : '▶'}
                                </button>
                                <button
                                    className="add-to-playlist-btn"
                                    title="Add to playlist"
                                    onClick={() => openPlaylistModal(surah)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No surahs found matching your filter</p>
                    </div>
                )}
            </div>

            {/* Rest of your modal and footer code remains the same */}
            {showPlaylistModal && selectedSurah && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add to Playlist</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowPlaylistModal(false)}
                                disabled={addingToPlaylist}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>Add "<strong>{selectedSurah.surahNameEn}</strong>" in <strong>{selectedLanguage}</strong> to:</p>

                            {playlists.length === 0 ? (
                                <div className="no-playlists">
                                    <p>No playlists found. Create a playlist first!</p>
                                </div>
                            ) : (
                                <div className="playlists-list">
                                    {playlists.map((playlist) => (
                                        <div key={playlist.playlistId} className="playlist-item">
                                            <div className="playlist-info">
                                                <span className="playlist-name">{playlist.playlistName}</span>
                                                <span className="playlist-count">({playlist.itemCount} items)</span>
                                            </div>
                                            <button
                                                className="add-to-playlist-modal-btn"
                                                onClick={() => addToPlaylist(playlist.playlistId, selectedSurah)}
                                                disabled={addingToPlaylist}
                                            >
                                                {addingToPlaylist ? 'Adding...' : `Add`}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowPlaylistModal(false)}
                                disabled={addingToPlaylist}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="browse-footer">
                <div className="stats">
                    <div className="stat-item">
                        <span className="stat-number">{surahs.length}</span>
                        <span className="stat-label">Total Surahs</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{surahs.filter(s => getSurahType(s.surahId) === 'makki').length}</span>
                        <span className="stat-label">Makki Surahs</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{surahs.filter(s => getSurahType(s.surahId) === 'madani').length}</span>
                        <span className="stat-label">Madani Surahs</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Browse;