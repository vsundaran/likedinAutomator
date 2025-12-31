import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../api/auth';

interface User {
    id: string;
    email: string;
    avatarUrl?: string;
    nicheId?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.getProfile();
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            Cookies.remove('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (data: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 7 }); // 7 days
        setUser(userData);
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
