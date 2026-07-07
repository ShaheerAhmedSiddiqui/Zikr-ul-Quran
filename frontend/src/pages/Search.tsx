import React, { useState, useEffect } from 'react';
import { surahAPI } from '../services/api';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Surah } from '../types';
import '../style/Search.css';

const Search: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Surah[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState('arabic');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Get audio player context with play/pause functions
    const {
        playSurah,
        pauseAudio,
        resumeAudio,
        currentSurah,
        isPlaying,
        currentLanguage: contextLanguage
    } = useAudioPlayer();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading recent searches:', error);
            }
        }
    }, []);

    // Save recent searches to localStorage
    useEffect(() => {
        if (recentSearches.length > 0) {
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        }
    }, [recentSearches]);

    // Perform search - FIXED: Handle multiple response structures
    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        try {
            setIsSearching(true);
            console.log('Searching for:', query);

            const response = await surahAPI.search(query);
            console.log('Search results:', response.data);

            // FIXED: Handle different response structures
            let searchResultsData: Surah[] = [];

            // Structure 1: response.data.data (nested in data property)
            if (response.data && Array.isArray(response.data.data)) {
                searchResultsData = response.data.data;
            }
            // Structure 2: response.data is directly the array
            else if (response.data && Array.isArray(response.data)) {
                searchResultsData = response.data;
            }
            // Structure 3: response is the array directly (fallback)
            else if (Array.isArray(response.data)) {
                searchResultsData = response.data;
            }

            setSearchResults(searchResultsData);
            setHasSearched(true);
        } catch (err: any) {
            console.error('Search error:', err);
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
            const newRecentSearches = [searchQuery, ...recentSearches.slice(0, 4)];
            setRecentSearches(newRecentSearches);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handlePlayPause = (surah: Surah) => {
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
                console.log('🎵 Starting new surah from search:', {
                    surah: surah.surahNameEn,
                    language: selectedLanguage
                });

                // Play the surah using context - pass search results as playlist and selected language
                playSurah(surah, searchResults, selectedLanguage);
            }
        } catch (err) {
            console.error('Error handling surah playback:', err);
        }
    };

    // Helper function to check if a surah is currently playing
    const isSurahPlaying = (surahId: number): boolean => {
        return currentSurah?.surahId === surahId &&
            contextLanguage === selectedLanguage &&
            isPlaying;
    };

    const handleRecentSearch = (search: string) => {
        setSearchQuery(search);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <div className="search-container">
            {/* Search Header */}
            <div className="search-header">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for surahs by name..."
                            className="search-input"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={clearSearch}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                        {isSearching && (
                            <div className="searching-indicator">
                                <div className="searching-spinner"></div>
                            </div>
                        )}
                    </div>
                </form>

                <div className="search-options">
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="language-dropdown"
                    >
                        <option value="arabic">Arabic Recitation</option>
                        <option value="english">English Translation</option>
                        <option value="urdu">Urdu Translation</option>
                    </select>
                </div>
            </div>

            {/* Search Results */}
            <div className="search-content">
                {hasSearched ? (
                    <div className="search-results">
                        <h2 className="results-title">
                            {isSearching ? 'Searching...' : `Search results for "${searchQuery}"`}
                        </h2>

                        {isSearching ? (
                            <div className="loading-results">
                                <div className="loading-spinner"></div>
                                <p>Searching surahs...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="results-grid">
                                {searchResults.map((surah) => (
                                    <div key={surah.surahId} className="result-card">
                                        <div className="result-image">
                                            <span className="surah-number">{surah.surahId}</span>
                                        </div>
                                        <div className="result-content">
                                            <h3 className="result-title">{surah.surahNameEn}</h3>
                                            <p className="result-subtitle">
                                                Surah {surah.surahId}
                                            </p>
                                            {isSurahPlaying(surah.surahId) && (
                                                <div className="now-playing-indicator">
                                                    Now Playing
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className={`result-play-btn ${isSurahPlaying(surah.surahId) ? 'playing' : ''}`}
                                            onClick={() => handlePlayPause(surah)}
                                            title={`${isSurahPlaying(surah.surahId) ? 'Pause' : 'Play'} ${surah.surahNameEn}`}
                                        >
                                            {isSurahPlaying(surah.surahId) ? '❚❚' : '▶'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <div className="no-results-icon">🎵</div>
                                <h3>No results found</h3>
                                <p>Try searching with different keywords</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="browse-categories">
                        {/* Your existing browse categories code remains the same */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;