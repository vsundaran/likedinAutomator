import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Stack, Chip, CircularProgress, Alert, List, ListItem, Divider } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppCard } from '../../components/atoms/AppCard';
import { AppButton } from '../../components/atoms/AppButton';
import { postsApi } from '../../api/posts';
import { authApi } from '../../api/auth';

interface Post {
    _id: string;
    title: string;
    content: string;
    status: 'pending' | 'success' | 'failed';
    imageUrl?: string;
    scheduledFor: string;
    postedAt?: string;
}

export default function ContentPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [postsRes, profileRes] = await Promise.all([
                postsApi.getPosts(),
                authApi.getProfile()
            ]);
            setPosts(postsRes.data.posts);
            setUserProfile(profileRes.data.user);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load content data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleManualPost = async () => {
        setIsPosting(true);
        try {
            await postsApi.createManualPost({});
            await fetchData(); // Refresh list
        } catch (err: any) {
            console.error('Failed to create manual post:', err);
            setError(err.response?.data?.message || 'Failed to create post.');
        } finally {
            setIsPosting(false);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    const currentPost = posts.find(p => p.status === 'pending') || posts[0];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2">AI Content Dashboard</Typography>
                <Chip
                    label={`Niche: ${userProfile?.nicheId?.name || 'Not Selected'}`}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={4}>
                {posts.length > 0 ? (
                    <>
                        {/* Left: Product Card & Actions */}
                        <Grid item xs={12} md={4}>
                            <AppCard sx={{ mb: 3 }}>
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    {currentPost.imageUrl && (
                                        <Box
                                            component="img"
                                            src={currentPost.imageUrl}
                                            sx={{ width: '100%', borderRadius: '12px', mb: 3 }}
                                            onError={(e: any) => e.target.src = 'https://via.placeholder.com/500'}
                                        />
                                    )}
                                    <Typography variant="h3" sx={{ fontSize: '18px', mb: 1 }}>{currentPost.title}</Typography>
                                    <Stack spacing={2} sx={{ mt: 3 }}>
                                        <AppButton
                                            variant="contained"
                                            fullWidth
                                            startIcon={<ContentPasteIcon />}
                                            onClick={handleManualPost}
                                            disabled={isPosting}
                                        >
                                            {isPosting ? <CircularProgress size={20} /> : 'Generate & Post Now'}
                                        </AppButton>
                                        <AppButton variant="outlined" fullWidth startIcon={<ScheduleIcon />}>Schedule</AppButton>
                                        <AppButton variant="text" fullWidth startIcon={<RefreshIcon />}>Regenerate Content</AppButton>
                                    </Stack>
                                </Box>
                            </AppCard>
                        </Grid>

                        {/* Right: AI Preview */}
                        <Grid item xs={12} md={8}>
                            <AppCard sx={{ p: 4 }}>
                                <Typography variant="h3" sx={{ fontSize: '18px', mb: 3 }}>AI-Generated Content Preview</Typography>
                                <Box sx={{ bgcolor: 'background.default', borderRadius: '16px', p: 4, mb: 4 }}>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                        {currentPost.content}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    <Chip label={currentPost.status.toUpperCase()} size="small" color={currentPost.status === 'success' ? 'success' : 'warning'} />
                                    <Chip label="Social Media Ready" size="small" />
                                </Stack>
                            </AppCard>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <AppCard sx={{ p: 3 }}>
                                        <Typography variant="h3" sx={{ fontSize: '16px', mb: 2 }}>Recent History</Typography>
                                        <List>
                                            {posts.slice(0, 5).map((post, idx) => (
                                                <Box key={post._id}>
                                                    <ListItem sx={{ py: 1.5, px: 0 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600}>{post.title}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {new Date(post.scheduledFor).toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                            <Chip label={post.status} size="small" color={post.status === 'success' ? 'success' : 'default'} variant="outlined" />
                                                        </Box>
                                                    </ListItem>
                                                    {idx < posts.length - 1 && <Divider />}
                                                </Box>
                                            ))}
                                        </List>
                                    </AppCard>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12}>
                        <AppCard sx={{ p: 6, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                No content generated yet. Start by generating your first post!
                            </Typography>
                            <AppButton
                                variant="contained"
                                startIcon={<ContentPasteIcon />}
                                onClick={handleManualPost}
                                disabled={isPosting}
                            >
                                {isPosting ? <CircularProgress size={20} /> : 'Generate First Post'}
                            </AppButton>
                        </AppCard>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
