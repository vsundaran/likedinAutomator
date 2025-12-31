import client from './client';

export const socialApi = {
    exchangeLinkedInCode: (code: string) => client.post('/linkedin/exchangeCodeForAccessToken', { code }),
    // YouTube and others can be added here
};
