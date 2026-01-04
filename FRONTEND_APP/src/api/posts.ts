import client from './client';

export const postsApi = {
    getPosts: () => client.get('/posts'),
    getStats: () => client.get('/posts/stats'),
    createManualPost: (postData: any) => client.post('/posts/manual', postData),
    retryPost: (id: string) => client.post(`/posts/${id}/retry`),
    updatePost: (id: string, data: any) => client.patch(`/posts/${id}`, data),
    getPostDetails: (id: string) => client.get(`/posts/${id}`),
    deletePost: (id: string) => client.delete(`/posts/${id}`),
};
