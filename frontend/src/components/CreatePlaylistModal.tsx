import React, { useState } from 'react';
import { playlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../style/CreatePlaylistModal.css';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePlaylist: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onCreatePlaylist
                                                                 }) => {
    const [playlistName, setPlaylistName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!playlistName.trim()) {
            setError('Playlist name is required');
            return;
        }

        if (!user) {
            setError('You must be logged in to create a playlist');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🎵 Creating playlist:', {
                playlistName: playlistName.trim(),
                userId: user.userId
            });

            const response = await playlistAPI.create({
                playlistName: playlistName.trim(),
                userId: user.userId
            });

            console.log('✅ Playlist created:', response.data);

            // Reset form
            setPlaylistName('');

            // Notify parent
            onCreatePlaylist();

            // Close modal
            onClose();

        } catch (err: any) {
            console.error('❌ Error creating playlist:', err);
            const errorMessage = err.response?.data?.error || 'Failed to create playlist';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPlaylistName('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Create New Playlist</h3>
                    <button
                        className="close-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="playlistName">Playlist Name</label>
                        <input
                            type="text"
                            id="playlistName"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="Enter playlist name"
                            disabled={loading}
                            maxLength={100}
                            autoFocus
                        />
                        <div className="character-count">
                            {playlistName.length}/100
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-btn"
                            disabled={loading || !playlistName.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Playlist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;