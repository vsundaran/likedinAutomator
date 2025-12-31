import client from './client';

export const nicheApi = {
    getAll: () => client.get('/niche'),
};
