import client from './client';

export const authApi = {
    login: (credentials: any) => client.post('/auth/login', credentials),
    signup: (userData: any) => client.post('/auth/signup', userData),
    sendOtp: (email: string, type: 'signup' | 'login' | 'reset_password') =>
        client.post('/auth/send-otp', { email, type }),
    forgotPassword: (email: string) => client.post('/auth/forgot-password', { email }),
    resetPassword: (data: any) => client.post('/auth/reset-password', data),
    getMe: () => client.get('/auth/me'),
    getProfile: () => client.get('/auth/profile'),
    updateAvatar: (formData: FormData) => client.post('/auth/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateNiche: (nicheId: string) => client.post('/auth/niche', { nicheId }),
    updateBankDetails: (bankDetails: any) => client.post('/auth/bank-details', bankDetails),
    logout: () => client.post('/auth/logout'),
};
