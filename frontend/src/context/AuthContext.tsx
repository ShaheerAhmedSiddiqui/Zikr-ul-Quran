import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { userAPI } from '../services/api';

interface User {
    userId: number;
    username: string;
    email: string;
}

// Define the actual response structure from backend
interface LoginResponse {
    message?: string;
    user?: User;
    error?: string;
    data?: {
        user?: User;
    };
    userId?: number;
    username?: string;
    email?: string;
    token?: string; // Added token field
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on app start
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('authToken');

        console.log('🔍 Checking stored auth data:', {
            user: savedUser ? 'Exists' : 'None',
            token: savedToken ? 'Exists' : 'None'
        });

        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                console.log('✅ Restored user from localStorage:', userData);
            } catch (error) {
                console.error('❌ Error parsing saved user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
            }
        }
        setIsLoading(false);
    }, []);

    const clearError = () => {
        setError(null);
    };

    const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            setIsLoading(true);
            clearError();
            console.log('🔐 Attempting login for:', username);

            const response = await userAPI.login({ username, password });
            console.log('✅ RAW Login response:', response);
            console.log('✅ Login response data:', response.data);
            console.log('✅ Login response headers:', response.headers);

            const responseData = response.data as LoginResponse;

            // DEBUG: Check if there's a token in the response
            if (responseData.token) {
                console.log('🎯 Token found in response:', responseData.token);
                localStorage.setItem('authToken', responseData.token);
            }

            if (response.headers['authorization']) {
                console.log('🎯 Token in headers:', response.headers['authorization']);
                const authHeader = response.headers['authorization'];
                if (authHeader.startsWith('Bearer ')) {
                    const token = authHeader.substring(7);
                    localStorage.setItem('authToken', token);
                    console.log('💾 Stored token from headers');
                }
            }

            // Handle user data extraction
            let userData: User | null = null;

            if (responseData.data?.user) {
                userData = responseData.data.user;
            } else if (responseData.user) {
                userData = responseData.user;
            } else if (responseData.userId) {
                userData = {
                    userId: responseData.userId,
                    username: responseData.username!,
                    email: responseData.email!
                };
            } else {
                // If no specific structure, use the entire data as user
                userData = responseData as User;
            }

            if (userData && userData.userId) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('🎉 Login successful, user set:', userData);
                console.log('💾 Stored auth data:', {
                    user: userData,
                    token: localStorage.getItem('authToken') ? 'Exists' : 'None'
                });

                return { success: true, message: 'Login successful' };
            }

            // Handle failed login
            if (responseData.error) {
                setError(responseData.error);
                return { success: false, message: responseData.error };
            }

            setError('Login failed - unexpected response format');
            return { success: false, message: 'Login failed - unexpected response format' };

        } catch (error: any) {
            console.error('💥 Login error:', error);

            let errorMessage = 'Login failed';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 401) {
                errorMessage = 'Invalid username or password';
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Please try again.';
            } else {
                errorMessage = error.message || 'Login failed';
            }

            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            setIsLoading(true);
            clearError();
            console.log('📝 Attempting registration for:', username, email);

            const response = await userAPI.register({ username, email, password });
            console.log('✅ Registration response:', response.data);

            const responseData = response.data as LoginResponse;

            // Check for token in registration response
            if (responseData.token) {
                console.log('🎯 Token found in registration response');
                localStorage.setItem('authToken', responseData.token);
            }

            // Handle user data extraction
            let userData: User | null = null;

            if (responseData.data?.user) {
                userData = responseData.data.user;
            } else if (responseData.user) {
                userData = responseData.user;
            } else if (responseData.userId) {
                userData = {
                    userId: responseData.userId,
                    username: responseData.username!,
                    email: responseData.email!
                };
            }

            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('🎉 Registration successful, user set:', userData);
                return { success: true, message: 'Registration successful' };
            }

            // Handle failed registration
            if (responseData.error) {
                setError(responseData.error);
                return { success: false, message: responseData.error };
            }

            setError('Registration failed - unexpected response format');
            return { success: false, message: 'Registration failed - unexpected response format' };

        } catch (error: any) {
            console.error('💥 Registration error:', error);

            let errorMessage = 'Registration failed';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Username or email already exists';
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Please try again.';
            } else {
                errorMessage = error.message || 'Registration failed';
            }

            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        console.log('🚪 Logging out user');
        setUser(null);
        setError(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        console.log('🧹 Cleared all auth data from storage');
    };

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        isLoading,
        error,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Debugger Component
export const AuthDebugger: React.FC = () => {
    const { user, logout } = useAuth();

    const testPlaylistAccess = async () => {
        try {
            console.log('🧪 Testing playlist access...');

            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');

            console.log('📋 Stored auth data:', {
                token: token ? `${token.substring(0, 20)}...` : 'No token',
                user: userData ? JSON.parse(userData) : 'No user data'
            });

            // Test playlist creation
            const testData = {
                playlistName: 'Test Playlist - ' + new Date().toISOString(),
                userId: user?.userId || 1
            };

            console.log('📤 Sending request with data:', testData);

            const response = await fetch('http://localhost:8080/api/playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-User-ID': user?.userId?.toString() || ''
                },
                body: JSON.stringify(testData)
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Playlist created successfully:', data);
                alert('✅ Playlist created successfully!');
            } else {
                const error = await response.text();
                console.error('❌ Playlist error:', error);
                alert('❌ Playlist creation failed: ' + error);
            }
        } catch (error) {
            console.error('💥 Test failed:', error);
            alert('💥 Test failed: ' + error);
        }
    };

    const checkAuthStatus = () => {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        console.log('🔐 Current Auth Status:');
        console.log('   User in context:', user);
        console.log('   User in localStorage:', storedUser ? JSON.parse(storedUser) : 'None');
        console.log('   Token exists:', !!token);
        console.log('   Token value:', token ? `${token.substring(0, 20)}...` : 'None');
    };

    return (
        <div style={{
            padding: '10px',
            border: '2px solid #007acc',
            margin: '10px',
            borderRadius: '8px',
            backgroundColor: '#f0f8ff'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#007acc' }}>🔐 Auth Debugger</h3>

            <div style={{ marginBottom: '10px' }}>
                <button
                    onClick={testPlaylistAccess}
                    style={{
                        marginRight: '10px',
                        padding: '8px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Playlist Access
                </button>

                <button
                    onClick={checkAuthStatus}
                    style={{
                        marginRight: '10px',
                        padding: '8px 12px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Check Auth Status
                </button>

                <button
                    onClick={logout}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <div><strong>Current User:</strong> {user ? JSON.stringify(user) : 'Not logged in'}</div>
                <div><strong>Token:</strong> {localStorage.getItem('authToken') ? 'Exists' : 'None'}</div>
                <div><strong>User ID:</strong> {user?.userId || 'None'}</div>
            </div>
        </div>
    );
};