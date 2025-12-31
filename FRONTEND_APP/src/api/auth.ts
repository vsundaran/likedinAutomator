import client from './client';

export const authApi = {
    login: (credentials: any) => client.post('/auth/login', credentials),
    signup: (userData: any) => client.post('/auth/signup', userData),
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
