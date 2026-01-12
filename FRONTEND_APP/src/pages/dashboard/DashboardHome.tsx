import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Select, MenuItem, FormControl, InputLabel,
    LinearProgress, IconButton, Link
} from '@mui/material';
import {
    LinkedIn as LinkedInIcon,
    Facebook as FacebookIcon,
    YouTube as YouTubeIcon,
    Visibility as PreviewIcon
} from '@mui/icons-material';
import { StatCard } from '../../components/molecules/StatCard';
import { AppCard } from '../../components/atoms/AppCard';
import { postsApi } from '../../api/posts';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

interface Post {
    _id: string;
    title: string;
    content: string;
    videoUrl?: string;
    status: 'pending' | 'success' | 'failed' | 'processing';
    platform?: 'linkedin' | 'fb' | 'yt';
    postedAt?: string;
    heygenVideoId?: string;
    progress?: number;
}

interface Stats {
    totalPosts: number;
    successfulPosts: number;
    failedPosts: number;
    pendingPosts: number;
    nextScheduledPost: string;
    lastPost: {
        title: string;
        postedAt: string;
    } | null;
}

export default function DashboardHome() {
    const { user, updateUser } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [activePost, setActivePost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingTime, setIsUpdatingTime] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, postsRes] = await Promise.all([
                postsApi.getStats(),
                postsApi.getPosts()
            ]);
            setStats(statsRes.data);
            const fetchedPosts = postsRes.data.posts;
            setPosts(fetchedPosts);

            // Find an active/pending post to show progress
            const processing = fetchedPosts.find((p: Post) => p.status === 'pending' || p.status === 'processing');
            if (processing) {
                setActivePost(processing);
            } else {
                setActivePost(null);
            }

            // Trigger initial post if no posts exist
            if (fetchedPosts.length === 0 && !isLoading) {
                handleAutoCreatePost();
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Could not load dashboard information.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Poll for active post progress
    useEffect(() => {
        if (!activePost) return;

        const interval = setInterval(async () => {
            try {
                // In a real app, we'd have a specific endpoint for progress
                // For now, we refresh all data to see if status changed
                const postsRes = await postsApi.getPosts();
                const latestPosts = postsRes.data.posts;
                setPosts(latestPosts);

                const stillProcessing = latestPosts.find((p: Post) => p._id === activePost._id);
                if (!stillProcessing || stillProcessing.status === 'success' || stillProcessing.status === 'failed') {
                    setActivePost(null);
                    fetchData(); // Refresh stats
                } else {
                    setActivePost(stillProcessing);
                }
            } catch (err) {
                console.error('Failed to poll progress:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activePost, fetchData]);

    const handleAutoCreatePost = async () => {
        try {
            await postsApi.createManualPost({});
            fetchData();
        } catch (err) {
            console.error('Failed to trigger initial post:', err);
        }
    };

    const handleTimeChange = async (event: any) => {
        const newTime = event.target.value;
        setIsUpdatingTime(true);
        try {
            await authApi.updatePostingTime(newTime);
            updateUser({ postingTime: newTime });
        } catch (err) {
            console.error('Failed to update posting time:', err);
            setError('Failed to update posting time preference.');
        } finally {
            setIsUpdatingTime(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const times = [];
    for (let i = 0; i < 24; i++) {
        const hour = i % 12 || 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        const label = `${hour}:00 ${ampm}`;
        times.push(label);
    }

    const statCards = [
        {
            title: 'Total Posts',
            value: stats?.totalPosts.toString() || '0',
            trend: 'Direct from your history',
            trendColor: 'text.secondary'
        },
        {
            title: 'Successful',
            value: stats?.successfulPosts.toString() || '0',
            trend: `${((stats?.successfulPosts || 0) / (stats?.totalPosts || 1) * 100).toFixed(1)}% success rate`,
            trendColor: 'success.main'
        },
        {
            title: 'Average Views',
            value: '1.2k',
            trend: '+12% from last week',
            trendColor: 'success.main'
        },
    ];

    const getPlatformIcon = (platform?: string) => {
        switch (platform) {
            case 'linkedin': return <LinkedInIcon color="primary" />;
            case 'fb': return <FacebookIcon color="primary" />;
            case 'yt': return <YouTubeIcon color="error" />;
            default: return <LinkedInIcon color="primary" />;
        }
    };

    const truncateContent = (content: string) => {
        const lines = content.split('\n');
        if (lines.length > 3) {
            return lines.slice(0, 3).join('\n') + '...';
        }
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2">Welcome Back, {user?.fullName || user?.email.split('@')[0]}!</Typography>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="posting-time-label">Posting Schedule</InputLabel>
                    <Select
                        labelId="posting-time-label"
                        value={user?.postingTime || '09:00 AM'}
                        label="Posting Schedule"
                        onChange={handleTimeChange}
                        disabled={isUpdatingTime}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                    >
                        {times.map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.title}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            {activePost && (
                <AppCard sx={{ p: 4, mb: 4, border: '1px solid', borderColor: 'primary.light', bgcolor: 'rgba(91, 140, 255, 0.02)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h3">Video Generation in Progress</Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {activePost.status === 'processing' ? 'Encoding...' : 'Initiating...'}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Currently generating your next viral video: <b>{activePost.title}</b>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={activePost.status === 'processing' ? 65 : 15}
                                sx={{ height: 10, borderRadius: 5 }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {activePost.status === 'processing' ? '65%' : '15%'}
                        </Typography>
                    </Box>
                </AppCard>
            )}

            <Typography variant="h3" sx={{ mb: 2 }}>Recent Automated Posts</Typography>
            <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell><b>Title</b></TableCell>
                            <TableCell><b>Platform</b></TableCell>
                            <TableCell><b>Script Preview</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell align="center"><b>Live URL/Preview</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <TableRow key={post._id} hover>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{post.title}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getPlatformIcon(post.platform)}
                                            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                                {post.platform || 'LinkedIn'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: '300px' }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                            {truncateContent(post.content)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                px: 1.5, py: 0.5, borderRadius: '4px', display: 'inline-block',
                                                bgcolor: post.status === 'success' ? '#DEF7EC' : post.status === 'failed' ? '#FDE8E8' : '#FEF3C7',
                                                color: post.status === 'success' ? '#03543F' : post.status === 'failed' ? '#9B1C1C' : '#92400E',
                                                fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'
                                            }}
                                        >
                                            {post.status}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        {post.status === 'success' && post.videoUrl ? (
                                            <IconButton component={Link} href={post.videoUrl} target="_blank">
                                                <PreviewIcon color="primary" />
                                            </IconButton>
                                        ) : (
                                            <Typography variant="caption" color="text.disabled">Not available</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No posts found. Your first post is being generated.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
