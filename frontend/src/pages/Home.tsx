import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surahAPI, audioAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Surah } from '../types';
import '../style/Home.css';

const Home: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('arabic');
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [recentSurahs, setRecentSurahs] = useState<Surah[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const {
        playSurah,
        pauseAudio,
        resumeAudio,
        currentSurah,
        isPlaying,
        currentLanguage
    } = useAudioPlayer(); // Get more context values

    // Fetch all surahs from backend - FIXED RESPONSE HANDLING
    const fetchSurahs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Fetching surahs from backend...');

            const response = await surahAPI.getAll();
            console.log('Surahs response:', response.data);

            // FIXED: Handle both response formats
            let surahsData: Surah[] = [];

            // Format 1: Direct array (what your backend is returning)
            if (Array.isArray(response.data)) {
                surahsData = response.data;
            }
            // Format 2: Nested under data property
            else if (response.data && Array.isArray(response.data.data)) {
                surahsData = response.data.data;
            }
            // Format 3: Any other structure with data array
            else if (response.data?.data && Array.isArray(response.data.data)) {
                surahsData = response.data.data;
            }
            else {
                throw new Error('Invalid response format from server');
            }

            setSurahs(surahsData);
            // Set recent surahs (first 6 for demo)
            setRecentSurahs(surahsData.slice(0, 6));

        } catch (err: any) {
            console.error('Error fetching surahs:', err);
            setError('Failed to load surahs. Please try again later.');
            // Fallback to empty array
            setSurahs([]);
            setRecentSurahs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSurahs();
    }, []);

    const handlePlayPause = async (surah: Surah) => {
        try {
            // If this surah is currently playing, toggle pause/resume
            if (currentSurah?.surahId === surah.surahId && currentLanguage === selectedLanguage) {
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

                // Verify audio file exists before playing (optional)
                const audioResponse = await audioAPI.getAudioPath(surah.surahId, selectedLanguage);
                console.log('Audio path:', audioResponse.data);

                // Play the surah using context - pass the selected language
                playSurah(surah, surahs, selectedLanguage);
            }
        } catch (err: any) {
            console.error('Error handling surah playback:', err);
            setError(`Cannot play ${surah.surahNameEn} in ${selectedLanguage}. Audio file may not be available.`);
        }
    };

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        // Note: We don't reset playing state here anymore since the audio player
        // will handle language changes when playing new surahs
    };

    const getPopularSurahs = () => {
        // Popular surahs for the browse section
        const popularSurahIds = [1, 2, 36, 55, 56, 67, 78, 112, 113, 114];
        return surahs.filter(surah => popularSurahIds.includes(surah.surahId));
    };

    // Helper function to check if a surah is currently playing
    const isSurahPlaying = (surah: Surah) => {
        return currentSurah?.surahId === surah.surahId &&
            currentLanguage === selectedLanguage &&
            isPlaying;
    };

    if (isLoading) {
        return (
            <div className="spotify-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading Quran recitations...</p>
                </div>
            </div>
        );
    }

    if (error && surahs.length === 0) {
        return (
            <div className="spotify-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Unable to Load Content</h3>
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
        <div className="spotify-container">
            {/* Header */}
            <div className="content-header">
                <div className="header-content">
                    <h1 className="page-title">
                        {user ? `Welcome, ${user.username}` : 'Quran Recitations'}
                    </h1>
                    <p className="page-subtitle">Listen to beautiful Quran recitations</p>
                </div>
                <div className="language-selector">
                    <label htmlFor="language-select" className="language-label">
                        Recitation Language:
                    </label>
                    <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="language-dropdown"
                    >
                        <option value="arabic">Arabic Recitation</option>
                        <option value="english">English Translation</option>
                        <option value="urdu">Urdu Translation</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="dismiss-btn">×</button>
                </div>
            )}

            {/* Popular Surahs Section */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Popular Surahs</h2>
                    <Link to="/browse" className="see-all-link">Browse all</Link>
                </div>
                <div className="grid-container">
                    {getPopularSurahs().length > 0 ? (
                        getPopularSurahs().map((surah) => (
                            <div key={surah.surahId} className="surah-card">
                                <div className="card-image">
                                    <div className="surah-number">{surah.surahId}</div>
                                    <div className="card-overlay">
                                        <button
                                            className={`card-play-btn ${isSurahPlaying(surah) ? 'playing' : ''}`}
                                            onClick={() => handlePlayPause(surah)}
                                            title={isSurahPlaying(surah) ? `Pause ${surah.surahNameEn}` : `Play ${surah.surahNameEn}`}
                                        >
                                            {isSurahPlaying(surah) ? '❚❚' : '▶'}
                                        </button>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{surah.surahNameEn}</h3>
                                    <p className="card-subtitle">Surah {surah.surahId}</p>
                                    {isSurahPlaying(surah) && (
                                        <div className="now-playing-indicator">
                                            Now Playing
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No popular surahs available</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            <section className="section sec_b">
                <h2 className="section-title">Available Content</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">114</div>
                        <div className="stat-label">Total Chapters</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">3</div>
                        <div className="stat-label">Languages</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;