import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor for auth tokens
api.interceptors.request.use(
    (config) => {
        // Try to get JWT token first
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`🔐 Adding Bearer token to request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        // Fallback: Add user ID header if no token but user exists
        const user = localStorage.getItem('user');
        if (user && !token) {
            try {
                const userData = JSON.parse(user);
                config.headers['X-User-ID'] = userData.userId;
                console.log(`👤 Adding User ID header to request: ${config.method?.toUpperCase()} ${config.url}`);
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
            }
        }

        // Log the final headers for debugging
        console.log(`📤 Final request headers for ${config.url}:`, {
            'Authorization': config.headers.Authorization ? 'Present' : 'Missing',
            'X-User-ID': config.headers['X-User-ID'] || 'Missing',
            'Content-Type': config.headers['Content-Type']
        });

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);

        // Check for new tokens in response headers
        if (response.headers['authorization']) {
            const authHeader = response.headers['authorization'];
            if (authHeader.startsWith('Bearer ')) {
                const newToken = authHeader.substring(7);
                localStorage.setItem('authToken', newToken);
                console.log('🔄 Updated auth token from response headers');
            }
        }

        return response;
    },
    (error) => {
        console.error('❌ API Error Details:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.log('🔐 401 Unauthorized - clearing user data');
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            // Optional: redirect to login page
            // window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            console.log('🚫 403 Forbidden - check authentication and permissions');
            console.log('🔍 Current auth state:', {
                token: localStorage.getItem('authToken') ? 'Exists' : 'None',
                user: localStorage.getItem('user') ? 'Exists' : 'None'
            });
        }

        if (error.code === 'ECONNABORTED') {
            console.error('⏰ Request timeout');
            throw new Error('Request timeout. Please check your connection.');
        }

        if (!error.response) {
            console.error('🌐 Network error');
            throw new Error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

// API Response Types
interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

interface User {
    userId: number;
    username: string;
    email: string;
}

interface Surah {
    surahId: number;
    surahNameEn: string;
    surahNameAr?: string;
    revelationType?: string;
}

interface Playlist {
    playlistId: number;
    playlistName: string;
    userId: number;
    items?: PlaylistItem[];
}

interface PlaylistItem {
    itemId: number;
    playlistId: number;
    surah: Surah;
    language: string; // NEW: Added language
    position: number;
}

interface AudioPath {
    filePath: string;
    url: string;
    surahId: number;
    language: string;
}

// User API
export const userAPI = {
    register: async (userData: { username: string; email: string; password: string }) => {
        console.log('📝 Registering user:', { username: userData.username, email: userData.email });
        const response = await api.post<ApiResponse<{ user: User; token?: string }>>('/users/register', {
            username: userData.username,
            email: userData.email,
            password: userData.password
        });
        return response;
    },

    login: async (credentials: { username: string; password: string }) => {
        console.log('🔐 Logging in user:', credentials.username);
        const response = await api.post<ApiResponse<{ user: User; token?: string }>>('/users/login', credentials);
        return response;
    },

    getUserById: (userId: number) => {
        console.log('👤 Fetching user by ID:', userId);
        return api.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    },

    checkUsername: (username: string) => {
        console.log('🔍 Checking username availability:', username);
        return api.get<ApiResponse<{ username: string; exists: boolean }>>(`/users/check-username/${username}`);
    },

    checkEmail: (email: string) => {
        console.log('🔍 Checking email availability:', email);
        return api.get<ApiResponse<{ email: string; exists: boolean }>>(`/users/check-email/${email}`);
    },
};

// Surah API
export const surahAPI = {
    getAll: () => {
        console.log('📖 Fetching all surahs');
        return api.get<ApiResponse<Surah[]>>('/surahs');
    },

    getById: (surahId: number) => {
        console.log('📖 Fetching surah by ID:', surahId);
        return api.get<ApiResponse<Surah>>(`/surahs/${surahId}`);
    },

    search: (name: string) => {
        console.log('🔍 Searching surahs by name:', name);
        return api.get<ApiResponse<Surah[]>>(`/surahs/search?name=${encodeURIComponent(name)}`);
    },

    getBatch: (surahIds: number[]) => {
        console.log('📚 Fetching batch of surahs:', surahIds);
        return api.post<ApiResponse<Surah[]>>('/surahs/batch', { surahIds });
    },
};

// Playlist API - UPDATED: All methods now support language
export const playlistAPI = {
    create: (playlistData: { playlistName: string; userId: number }) => {
        console.log('🎵 Creating playlist:', playlistData);
        return api.post<ApiResponse<Playlist>>('/playlists', playlistData);
    },

    getUserPlaylists: (userId: number) => {
        console.log('🎵 Fetching playlists for user:', userId);
        return api.get<ApiResponse<Playlist[]>>(`/playlists/user/${userId}`);
    },

    getPlaylistById: (playlistId: number, userId: number) => {
        console.log('🎵 Fetching playlist by ID:', playlistId);
        return api.get<ApiResponse<Playlist>>(`/playlists/${playlistId}?userId=${userId}`);
    },

    delete: (playlistId: number, userId: number) => {
        console.log('🗑️ Deleting playlist:', playlistId);
        return api.delete<ApiResponse<{ message: string }>>(`/playlists/${playlistId}?userId=${userId}`);
    },

    // UPDATED: Now includes language parameter
    addSurah: (playlistId: number, surahId: number, userId: number, language: string) => {
        console.log('➕ Adding surah to playlist:', { playlistId, surahId, language });
        return api.post<ApiResponse<PlaylistItem>>(
            `/playlists/${playlistId}/surahs/${surahId}?userId=${userId}&language=${language}`
        );
    },

    // UPDATED: Now includes language parameter
    removeSurah: (playlistId: number, surahId: number, userId: number, language: string) => {
        console.log('➖ Removing surah from playlist:', { playlistId, surahId, language });
        return api.delete<ApiResponse<{ message: string }>>(
            `/playlists/${playlistId}/surahs/${surahId}?userId=${userId}&language=${language}`
        );
    },

    getItems: (playlistId: number) => {
        console.log('📋 Fetching playlist items for:', playlistId);
        return api.get<ApiResponse<PlaylistItem[]>>(`/playlists/${playlistId}/items`);
    },

    getNextSurah: (playlistId: number, currentPosition: number) => {
        console.log('⏭️ Getting next surah for playlist:', playlistId);
        return api.get<ApiResponse<PlaylistItem>>(`/playlists/${playlistId}/next/${currentPosition}`);
    },

    getPreviousSurah: (playlistId: number, currentPosition: number) => {
        console.log('⏮️ Getting previous surah for playlist:', playlistId);
        return api.get<ApiResponse<PlaylistItem>>(`/playlists/${playlistId}/previous/${currentPosition}`);
    },
};

// Audio API
export const audioAPI = {
    getAudioPath: (surahId: number, language: string) => {
        console.log('🎵 Getting audio path for:', { surahId, language });
        return api.get<ApiResponse<AudioPath>>(`/audio/surah/${surahId}/${language}`);
    },

    getAudioFile: (surahId: number, language: string) => {
        console.log('🎵 Getting audio file for:', { surahId, language });
        return api.get(`/audio/files/${language}/${surahId}`, { responseType: 'blob' });
    },

    getLanguages: () => {
        console.log('🌐 Getting available languages');
        return api.get<ApiResponse<{ languages: string[]; default: string }>>('/audio/languages');
    },

    debugAudio: (surahId: number, language: string) => {
        console.log('🔧 Debugging audio file:', { surahId, language });
        return api.get(`/audio/debug/${language}/${surahId}`);
    },

    healthCheck: () => {
        console.log('❤️ Audio health check');
        return api.get('/audio/health');
    },
};

// Test API connection
export const testAPI = {
    status: () => {
        console.log('🔧 Testing API status');
        return api.get<ApiResponse<string>>('/status');
    },

    endpoints: () => {
        console.log('🔧 Testing API endpoints');
        return api.get<ApiResponse<Record<string, string>>>('/endpoints');
    },

    test: () => {
        console.log('🔧 Testing API connection');
        return api.get<ApiResponse<{ message: string; status: string; app: string }>>('/test');
    },
};

// Utility functions
export const handleApiError = (error: any): string => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || error.message;
        console.error('❌ API Error:', message);
        return message;
    }
    console.error('❌ Unknown error:', error);
    return error.message || 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
    return axios.isAxiosError(error) && !error.response;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (user) {
        try {
            const userData = JSON.parse(user);
            headers['X-User-ID'] = userData.userId.toString();
        } catch (error) {
            console.error('Error parsing user data for headers:', error);
        }
    }

    return headers;
};

// Export the axios instance for direct use
export default api;