import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext'; // Import the hook
import { playlistAPI } from '../services/api';
import '../style/Sidebar.css';

interface Playlist {
    playlistId: number;
    playlistName: string;
    userId: number;
    items?: any[];
    itemCount?: number;
}

interface SidebarProps {
    playlists?: Playlist[];
    onPlaylistsUpdate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ playlists: externalPlaylists, onPlaylistsUpdate }) => {
    const location = useLocation();
    const { user } = useAuth();
    const { isPlayerActive } = useAudioPlayer(); // Get the player active state
    const [playlists, setPlaylists] = useState<Playlist[]>(externalPlaylists || []);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch user's playlists from backend
    const fetchPlaylists = async () => {
        if (user) {
            try {
                setIsLoading(true);
                console.log('🔄 Fetching playlists for user:', user.userId);

                const response = await playlistAPI.getUserPlaylists(user.userId);
                console.log('📦 Playlists response:', response.data);

                let playlistsData: Playlist[] = [];

                if (Array.isArray(response.data)) {
                    playlistsData = response.data;
                } else if (response.data && Array.isArray(response.data)) {
                    playlistsData = response.data;
                } else {
                    console.error('❌ Unexpected response format:', response.data);
                    playlistsData = [];
                }

                console.log(`✅ Loaded ${playlistsData.length} playlists`);
                playlistsData.forEach(p => {
                    console.log(`📝 Playlist: ${p.playlistName}, Count: ${p.itemCount}, Items: ${p.items?.length}`);
                });

                setPlaylists(playlistsData);

                // Notify parent component about update
                if (onPlaylistsUpdate) {
                    onPlaylistsUpdate();
                }
            } catch (error) {
                console.error('❌ Error fetching playlists:', error);
                setPlaylists([]);
            } finally {
                setIsLoading(false);
            }
        } else if (externalPlaylists) {
            setPlaylists(externalPlaylists);
        } else {
            setPlaylists([]);
        }
    };

    // Refresh function that can be called externally
    const refreshPlaylists = () => {
        fetchPlaylists();
    };

    useEffect(() => {
        fetchPlaylists();
    }, [user, externalPlaylists]);

    // Use itemCount from backend first, fallback to items length
    const getPlaylistItemCount = (playlist: Playlist): number => {
        if (playlist.itemCount !== undefined && playlist.itemCount !== null) {
            return playlist.itemCount;
        }
        return playlist.items?.length || 0;
    };

    return (
        <div className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <Link to="/" className="logo-link">
                    <span className="logo-icon">🕌</span>
                    <span className="logo-text">Zikr-ul-Quran</span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="sidebar-nav">
                <Link
                    to="/"
                    className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">Home</span>
                </Link>

                <Link
                    to="/search"
                    className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}
                >
                    <span className="nav-icon">🔍</span>
                    <span className="nav-text">Search</span>
                </Link>

                <Link
                    to="/browse"
                    className={`nav-item ${location.pathname === '/browse' ? 'active' : ''}`}
                >
                    <span className="nav-icon">📚</span>
                    <span className="nav-text">Browse</span>
                </Link>

                {/* Add Playlists page link */}
                <Link
                    to="/playlists"
                    className={`nav-item ${location.pathname === '/playlists' ? 'active' : ''}`}
                >
                    <span className="nav-icon">📋</span>
                    <span className="nav-text">All Playlists</span>
                </Link>
            </nav>

            {/* User Section */}
            <div className={`user-section ${isPlayerActive ? 'player-active' : ''}`}>
                {user ? (
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user.username}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                    </div>
                ) : (
                    <div className="user-info">
                        <div className="user-avatar">👤</div>
                        <div className="user-details">
                            <span className="user-name">Guest User</span>
                            <Link to="/login" className="login-link">Sign in</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;