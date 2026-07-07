import React from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import '../style/AudioPlayer.css';

const AudioPlayer: React.FC = () => {
    const {
        currentSurah,
        isPlaying,
        progress,
        currentTime,
        duration,
        pauseAudio,
        resumeAudio,
        nextSurah,
        previousSurah,
        toggleLoop,
        toggleShuffle,
        isLooping,
        isShuffling,
        setProgress,
        closeAudio,
        volume,
        setVolume,
        currentLanguage // Add this line to import currentLanguage
    } = useAudioPlayer();

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return '0:00';

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.clientWidth;
        const newProgress = (clickPosition / progressBarWidth) * 100;
        setProgress(newProgress);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const togglePlay = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            resumeAudio();
        }
    };

    if (!currentSurah) {
        return null;
    }

    return (
        <div className="audio-player">
            <div className="player-content">
                {/* Track Info */}
                <div className="track-info">
                    <div className="track-image">
                        <span className="surah-number">{currentSurah.surahId}</span>
                    </div>
                    <div className="track-details">
                        <h4 className="track-title">{currentSurah.surahNameEn}</h4>
                        <p className="track-artist">
                            Surah {currentSurah.surahId} • {currentLanguage.toUpperCase()}
                        </p>
                    </div>
                    {/* Close Button */}
                    <button className="close-btn" onClick={closeAudio} title="Close player">
                        ×
                    </button>
                </div>

                {/* Playback Controls */}
                <div className="playback-controls">
                    <div className="control-buttons">
                        <button
                            className="control-btn previous"
                            onClick={previousSurah}
                            title="Previous surah"
                        >
                            ⏮
                        </button>
                        <button
                            className="play-btn large"
                            onClick={togglePlay}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? '❚❚' : '▶'}
                        </button>
                        <button
                            className="control-btn next"
                            onClick={nextSurah}
                            title="Next surah"
                        >
                            ⏭
                        </button>
                    </div>

                    <div className="progress-container">
                        <span className="time-current">{formatTime(currentTime)}</span>
                        <div className="progress-bar-container" onClick={handleProgressClick}>
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="time-duration">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume Control */}
                <div className="volume-controls">
                    <button className="volume-btn">
                        {volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-bar"
                    />
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;