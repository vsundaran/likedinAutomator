import client from './client';

export const socialApi = {
    getAccounts: () => client.get('/social/accounts'),
    disconnectPlatform: (platform: string) => client.delete(`/social/${platform}`),
};
