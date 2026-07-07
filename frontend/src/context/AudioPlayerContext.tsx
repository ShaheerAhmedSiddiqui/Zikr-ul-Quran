import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Surah } from '../types';

interface AudioPlayerContextType {
    currentSurah: Surah | null;
    isPlaying: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    playSurah: (surah: Surah, playlist?: Surah[], language?: string) => void;
    playSurahFromPlaylist: (surah: Surah, language: string, playlist?: PlaylistItem[]) => void;
    pauseAudio: () => void;
    resumeAudio: () => void;
    nextSurah: () => void;
    previousSurah: () => void;
    toggleLoop: () => void;
    toggleShuffle: () => void;
    isLooping: boolean;
    isShuffling: boolean;
    setProgress: (progress: number) => void;
    playlist: PlaylistItem[];
    currentIndex: number;
    closeAudio: () => void;
    volume: number;
    setVolume: (volume: number) => void;
    currentLanguage: string;
    isPlayerActive: boolean; // NEW: Add this line
}

interface PlaylistItem {
    surah: Surah;
    language: string;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [volume, setVolumeState] = useState(0.7);
    const [currentLanguage, setCurrentLanguage] = useState('arabic');
    const [isPlayerActive, setIsPlayerActive] = useState(false); // NEW: Add this state

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Define playSurah for regular browsing (uses current language)
    const playSurah = useCallback((surah: Surah, surahList: Surah[] = [], language: string = 'arabic') => {
        if (!audioRef.current) {
            console.error('❌ Audio element not initialized');
            return;
        }

        try {
            console.log('🎵 Starting to play surah (browse mode):', {
                surah: surah.surahNameEn,
                language: language,
                playlistSize: surahList.length
            });

            // NEW: Set player as active
            setIsPlayerActive(true);

            // Stop current audio completely
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            // Convert Surah[] to PlaylistItem[] for internal storage
            const newPlaylist: PlaylistItem[] = surahList.length > 0
                ? surahList.map(s => ({ surah: s, language }))
                : [{ surah, language }];

            const surahIndex = newPlaylist.findIndex(item => item.surah.surahId === surah.surahId);

            console.log('📋 Setting browse playlist:', {
                playlistSize: newPlaylist.length,
                currentIndex: surahIndex,
                language: language
            });

            setPlaylist(newPlaylist);
            setCurrentIndex(surahIndex);
            setCurrentSurah(surah);
            setCurrentLanguage(language);
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);

            // Set audio source with the selected language
            const audioUrl = `http://localhost:8080/api/audio/files/${language}/${surah.surahId}`;
            console.log('🔗 Audio URL:', audioUrl);

            audioRef.current.src = audioUrl;

            // Define event handlers
            const handleCanPlayThrough = () => {
                console.log('🚀 Audio can play through, starting playback...');
                audioRef.current?.play()
                    .then(() => {
                        setIsPlaying(true);
                        console.log('✅ Audio started playing successfully');
                    })
                    .catch(error => {
                        console.error('❌ Error playing audio:', error);
                        setIsPlaying(false);
                    });
            };

            const handleError = (e: any) => {
                console.error('❌ Audio loading error:', e);
                console.error('🔍 Audio error details:', {
                    error: audioRef.current?.error,
                    src: audioRef.current?.src,
                    networkState: audioRef.current?.networkState,
                    readyState: audioRef.current?.readyState
                });
                setIsPlaying(false);
            };

            // Remove any existing event listeners
            audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
            audioRef.current.removeEventListener('error', handleError);

            // Add new event listeners
            audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough);
            audioRef.current.addEventListener('error', handleError);

            // Load the audio
            audioRef.current.load();

        } catch (error) {
            console.error('❌ Error in playSurah:', error);
            setIsPlaying(false);
        }
    }, []);

    // playSurahFromPlaylist for playlist items with stored language
    const playSurahFromPlaylist = useCallback((surah: Surah, language: string, playlistItems: PlaylistItem[] = []) => {
        if (!audioRef.current) {
            console.error('❌ Audio element not initialized');
            return;
        }

        try {
            console.log('🎵 Starting to play surah (playlist mode):', {
                surah: surah.surahNameEn,
                storedLanguage: language,
                playlistSize: playlistItems.length
            });

            // NEW: Set player as active
            setIsPlayerActive(true);

            // Stop current audio completely
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            // Use the provided playlist items or create a single item
            const newPlaylist: PlaylistItem[] = playlistItems.length > 0
                ? playlistItems
                : [{ surah, language }];

            const surahIndex = newPlaylist.findIndex(item =>
                item.surah.surahId === surah.surahId && item.language === language
            );

            console.log('📋 Setting playlist with stored languages:', {
                playlistSize: newPlaylist.length,
                currentIndex: surahIndex,
                storedLanguage: language
            });

            setPlaylist(newPlaylist);
            setCurrentIndex(surahIndex);
            setCurrentSurah(surah);
            setCurrentLanguage(language); // Use the stored language from playlist
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);

            // Set audio source with the STORED language from playlist item
            const audioUrl = `http://localhost:8080/api/audio/files/${language}/${surah.surahId}`;
            console.log('🔗 Audio URL (using stored language):', audioUrl);

            audioRef.current.src = audioUrl;

            // Define event handlers
            const handleCanPlayThrough = () => {
                console.log('🚀 Audio can play through, starting playback...');
                audioRef.current?.play()
                    .then(() => {
                        setIsPlaying(true);
                        console.log('✅ Audio started playing successfully with stored language:', language);
                    })
                    .catch(error => {
                        console.error('❌ Error playing audio:', error);
                        setIsPlaying(false);
                    });
            };

            const handleError = (e: any) => {
                console.error('❌ Audio loading error:', e);
                console.error('🔍 Audio error details:', {
                    error: audioRef.current?.error,
                    src: audioRef.current?.src,
                    networkState: audioRef.current?.networkState,
                    readyState: audioRef.current?.readyState
                });
                setIsPlaying(false);
            };

            // Remove any existing event listeners
            audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
            audioRef.current.removeEventListener('error', handleError);

            // Add new event listeners
            audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough);
            audioRef.current.addEventListener('error', handleError);

            // Load the audio
            audioRef.current.load();

        } catch (error) {
            console.error('❌ Error in playSurahFromPlaylist:', error);
            setIsPlaying(false);
        }
    }, []);

    // Define nextSurah - UPDATED to use stored language from playlist items
    const nextSurah = useCallback(() => {
        console.log('🎯 Next surah called. Playlist:', playlist.length, 'Current index:', currentIndex);

        if (playlist.length === 0) {
            console.log('❌ No playlist available for next surah');
            return;
        }

        let nextIndex;
        if (isShuffling) {
            // Get random index different from current
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } while (nextIndex === currentIndex && playlist.length > 1);
            console.log('🎲 Shuffling to random surah:', nextIndex);
        } else {
            // Sequential playback - go to next, loop back to first if at end
            nextIndex = (currentIndex + 1) % playlist.length;
            console.log('➡️ Moving to next surah:', nextIndex, '/', playlist.length);
        }

        if (nextIndex >= 0 && nextIndex < playlist.length) {
            const nextItem = playlist[nextIndex];
            console.log('🎵 Playing next surah:', {
                name: nextItem.surah.surahNameEn,
                storedLanguage: nextItem.language,
                index: nextIndex
            });

            // Use the stored language from the playlist item
            playSurahFromPlaylist(nextItem.surah, nextItem.language, playlist);
        } else {
            // End of playlist
            console.log('🏁 End of playlist reached');
            closeAudio();
        }
    }, [playlist, currentIndex, isShuffling, playSurahFromPlaylist]);

    // Define previousSurah - UPDATED to use stored language from playlist items
    const getPreviousIndex = useCallback(() => {
        if (playlist.length === 0) return -1;

        if (isShuffling) {
            // Get random index different from current
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentIndex && playlist.length > 1);
            return randomIndex;
        } else {
            // Sequential playback - go to previous, loop to last if at first
            return currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        }
    }, [playlist, currentIndex, isShuffling]);

    const previousSurah = useCallback(() => {
        const prevIndex = getPreviousIndex();
        console.log('⏮️ Previous surah called. Previous index:', prevIndex);

        if (prevIndex !== -1 && prevIndex < playlist.length) {
            const prevItem = playlist[prevIndex];
            console.log('🎵 Playing previous surah:', {
                name: prevItem.surah.surahNameEn,
                storedLanguage: prevItem.language
            });

            // Use the stored language from the playlist item
            playSurahFromPlaylist(prevItem.surah, prevItem.language, playlist);
        }
    }, [getPreviousIndex, playSurahFromPlaylist, playlist]);

    // Initialize audio element only once
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.volume = volume;

            audioRef.current.addEventListener('loadedmetadata', () => {
                setDuration(audioRef.current?.duration || 0);
            });

            audioRef.current.addEventListener('timeupdate', () => {
                const current = audioRef.current?.currentTime || 0;
                const total = audioRef.current?.duration || 1;
                setCurrentTime(current);
                setProgress((current / total) * 100);
            });

            audioRef.current.addEventListener('canplay', () => {
                console.log('✅ Audio can play');
            });

            audioRef.current.addEventListener('error', (e) => {
                console.error('❌ Audio error:', e);
            });
        }

        // Cleanup function
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleAudioEnded);
            }
        };
    }, []);

    // Handle audio ended event - auto advance to next surah
    const handleAudioEnded = useCallback(() => {
        console.log('🎵 Audio ended, checking for next surah...');
        console.log('🔍 Current state:', {
            isLooping,
            playlistLength: playlist.length,
            currentIndex,
            currentSurah: currentSurah?.surahNameEn,
            currentLanguage
        });

        if (isLooping && currentSurah) {
            // Restart current surah if looping
            console.log('🔁 Looping current surah');
            audioRef.current?.play().catch(console.error);
        } else if (playlist.length > 0) {
            // Move to next surah automatically - this will use stored language
            console.log('⏭️ Auto-advancing to next surah');
            nextSurah();
        } else {
            console.log('❌ No playlist available for next surah');
            setIsPlaying(false);
        }
    }, [isLooping, playlist, currentIndex, currentSurah, currentLanguage, nextSurah]);

    // Update ended event listener when dependencies change
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.addEventListener('ended', handleAudioEnded);

        return () => {
            audio.removeEventListener('ended', handleAudioEnded);
        };
    }, [handleAudioEnded]);

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const setVolume = (newVolume: number) => {
        setVolumeState(newVolume);
    };

    const pauseAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            console.log('⏸️ Audio paused');
        }
    }, []);

    const resumeAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    console.log('▶️ Audio resumed');
                })
                .catch(error => {
                    console.error('Error resuming audio:', error);
                    setIsPlaying(false);
                });
        }
    }, []);

    const toggleLoop = useCallback(() => {
        const newLoopingState = !isLooping;
        setIsLooping(newLoopingState);
        console.log('🔁 Loop toggled:', newLoopingState);
    }, [isLooping]);

    const toggleShuffle = useCallback(() => {
        const newShufflingState = !isShuffling;
        setIsShuffling(newShufflingState);
        console.log('🔀 Shuffle toggled:', newShufflingState);
    }, [isShuffling]);

    const handleSetProgress = useCallback((newProgress: number) => {
        if (audioRef.current && duration > 0) {
            const newTime = (newProgress / 100) * duration;
            audioRef.current.currentTime = newTime;
            setProgress(newProgress);
            setCurrentTime(newTime);
        }
    }, [duration]);

    // Close audio player completely - UPDATED to set player as inactive
    const closeAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
        }
        setCurrentSurah(null);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setPlaylist([]);
        setCurrentIndex(-1);
        setCurrentLanguage('arabic');
        setIsPlayerActive(false); // NEW: Set player as inactive
        console.log('🗑️ Audio player closed');
    }, []);

    return (
        <AudioPlayerContext.Provider value={{
            currentSurah,
            isPlaying,
            progress,
            currentTime,
            duration,
            playSurah,
            playSurahFromPlaylist,
            pauseAudio,
            resumeAudio,
            nextSurah,
            previousSurah,
            toggleLoop,
            toggleShuffle,
            isLooping,
            isShuffling,
            setProgress: handleSetProgress,
            playlist,
            currentIndex,
            closeAudio,
            volume,
            setVolume,
            currentLanguage,
            isPlayerActive // NEW: Export the state
        }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};