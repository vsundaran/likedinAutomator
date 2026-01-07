import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../api/auth';

interface Niche {
    _id: string;
    name: string;
    description: string;
    topics: string[];
}

interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    nicheId?: string | Niche;
    bankDetails?: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        bankName: string;
    };
}

interface OnboardingStatus {
    isNicheCompleted: boolean;
    isSocialConnected: boolean;
    isBankDetailsCompleted: boolean;
}

interface AuthContextType {
    user: User | null;
    onboardingStatus: OnboardingStatus | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User, onboardingStatus?: OnboardingStatus) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
    updateOnboardingStatus: (status: Partial<OnboardingStatus>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setUser(null);
            setOnboardingStatus(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.getProfile();
            setUser(response.data.user);
            setOnboardingStatus(response.data.onboardingStatus);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            Cookies.remove('token');
            setUser(null);
            setOnboardingStatus(null);
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

    const login = (token: string, userData: User, status?: OnboardingStatus) => {
        Cookies.set('token', token, { expires: 7 }); // 7 days
        setUser(userData);
        if (status) setOnboardingStatus(status);
        else refreshUser();
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            Cookies.remove('token');
            setUser(null);
            setOnboardingStatus(null);
        }
    };

    const updateOnboardingStatus = (status: Partial<OnboardingStatus>) => {
        setOnboardingStatus(prev => prev ? { ...prev, ...status } : null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            onboardingStatus,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            refreshUser,
            updateUser,
            updateOnboardingStatus
        }}>
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
