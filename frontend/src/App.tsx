import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import './style/App.css';
import { LanguageProvider } from './context/LanguageContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Browse from './pages/Browse';
import PlaylistView from './pages/PlaylistView';
import Playlists from './pages/Playlists';

// Main App Component without useAuth
const AppContent: React.FC = () => {
    const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);

    return (
        <Router>
            <div className="App">
                {/* Remove playlists prop from Sidebar - it will fetch internally */}
                <Sidebar />
                <div className="main-content">
                    <Navbar
                        onCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
                    />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/browse" element={<Browse />} />
                            <Route path="*" element={<Navigate to="/" />} />
                            <Route path="/playlist/:playlistId" element={<PlaylistView />} />
                            <Route path="/playlists" element={<Playlists />} />
                        </Routes>
                    </main>
                </div>

                {/* Audio Player - Now controlled by context */}
                <AudioPlayer />

                {/* Create Playlist Modal */}
                <CreatePlaylistModal
                    isOpen={isCreatePlaylistModalOpen}
                    onClose={() => setIsCreatePlaylistModalOpen(false)}
                    onCreatePlaylist={() => {
                        // This will be handled by the sidebar refresh
                        setIsCreatePlaylistModalOpen(false);
                    }}
                />
            </div>
        </Router>
    );
};

// Root App Component with AuthProvider and AudioPlayerProvider
// const App: React.FC = () => {
//     return (
//         <AuthProvider>
//             <AudioPlayerProvider>
//                 <AppContent />
//             </AudioPlayerProvider>
//         </AuthProvider>
//     );
// };
const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AuthProvider>
                <AudioPlayerProvider>
                    <AppContent />
                </AudioPlayerProvider>
            </AuthProvider>
        </LanguageProvider>
    );
};

export default App;