import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import { SimplePlaylist } from '../types';
import { useParams, useNavigate } from 'react-router-dom';

import '../style/Playlists.css';

const Playlists: React.FC = () => {
    const [playlists, setPlaylists] = useState<SimplePlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deletingPlaylist, setDeletingPlaylist] = useState<number | null>(null);

    const { user } = useAuth();

    const fetchPlaylists = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            console.log('🔄 Fetching playlists for user:', user.userId);

            const response = await playlistAPI.getUserPlaylists(user.userId);
            console.log('📦 Playlists response:', response.data);

            let playlistsData: any[] = [];

            if (Array.isArray(response.data)) {
                playlistsData = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                playlistsData = response.data.data;
            } else {
                playlistsData = [];
            }

            const typedPlaylists: SimplePlaylist[] = playlistsData.map((playlist: any) => ({
                playlistId: Number(playlist.playlistId),
                playlistName: String(playlist.playlistName),
                userId: Number(playlist.userId),
                itemCount: Number(playlist.itemCount || 0)
            }));

            console.log('✅ Loaded playlists with counts:', typedPlaylists.map(p =>
                `${p.playlistName}: ${p.itemCount} items`
            ));

            setPlaylists(typedPlaylists);
        } catch (err: any) {
            console.error('Error fetching playlists:', err);
            setError('Failed to load playlists');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPlaylists();
    }, [user, fetchPlaylists]);

    const deletePlaylist = async (playlistId: number) => {
        if (!user) return;

        try {
            setDeletingPlaylist(playlistId);
            await playlistAPI.delete(playlistId, user.userId);
            fetchPlaylists();
        } catch (err) {
            console.error('Error deleting playlist:', err);
            alert('Failed to delete playlist');
        } finally {
            setDeletingPlaylist(null);
        }
    };

    const handlePlaylistCreated = () => {
        setShowCreateModal(false);
        fetchPlaylists();
    };
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
            <div className="playlists-container">
                <div className="loading">Loading your playlists...</div>
            </div>
        );
    }

    return (
        <div className="playlists-container">
            <div className="playlists-header">
                <h1 className="page-title">Your Playlists</h1>
                {/*<p className="page-subtitle">*/}
                {/*    Manage your Quran playlists*/}
                {/*</p>*/}

                {/*<button*/}
                {/*    className="create-playlist-btn"*/}
                {/*    onClick={() => setShowCreateModal(true)}*/}
                {/*>*/}
                {/*    + Create New Playlist*/}
                {/*</button>*/}
            </div>

            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="dismiss-btn">×</button>
                </div>
            )}

            <div className="playlists-grid">
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <div key={playlist.playlistId} className="playlist-card">
                            <div className="card-detail">
                                <h3 className="playlist-name">{playlist.playlistName}</h3>
                                <div className="playlist-count">
                                    {playlist.itemCount} surah{playlist.itemCount !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link
                                    to={`/playlist/${playlist.playlistId}`}
                                    className="view-btn"
                                >
                                    View Playlist
                                </Link>
                                <button
                                    className="delete-btn"
                                    onClick={() => deletePlaylist(playlist.playlistId)}
                                    disabled={deletingPlaylist === playlist.playlistId}
                                    title="Delete Playlist"
                                >
                                    {deletingPlaylist === playlist.playlistId ? 'Deleting...' : 'X'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🎵</div>
                        <h1>No Playlists Yet</h1>
                        <p>Create your first playlist to organize your favorite surahs</p>
                        <button
                            className="create-first-btn"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create Your First Playlist
                        </button>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreatePlaylistModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreatePlaylist={handlePlaylistCreated}
                />
            )}
        </div>
    );
};

export default Playlists;