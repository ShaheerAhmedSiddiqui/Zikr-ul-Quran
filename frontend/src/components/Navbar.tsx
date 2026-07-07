import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/Navbar.css';

interface NavbarProps {
    onCreatePlaylist: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCreatePlaylist }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="nav-content">
                <div className="nav-actions">
                    {user && (
                        <button
                            className="create-playlist-nav-btn"
                            onClick={onCreatePlaylist}
                            title="Create new playlist"
                        >
                            + Create Playlist
                        </button>
                    )}
                </div>

                <div className="nav-links">
                    {user ? (
                        <>
                            <span className="user-greeting">Welcome, {user.username}</span>
                            <button className="nav-link logout-btn" onClick={logout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;