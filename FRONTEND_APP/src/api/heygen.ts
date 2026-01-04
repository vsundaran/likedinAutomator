import client from './client';

export const heygenApi = {
    addMotion: (data: { prompt?: string; motion_type?: string }) =>
        client.post('/heygen/add-motion', data),

    getStatus: () =>
        client.get('/heygen/status'),
};
