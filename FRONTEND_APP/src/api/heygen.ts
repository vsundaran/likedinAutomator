import client from './client';

export const heygenApi = {
    addMotion: (data: { prompt?: string; motion_type?: string }) =>
        client.post('/heygen/add-motion', data),

    getStatus: (videoId?: string) =>
        client.get(videoId ? `/heygen/status/${videoId}` : '/heygen/status'),
};
