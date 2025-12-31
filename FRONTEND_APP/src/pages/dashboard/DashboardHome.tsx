import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { StatCard } from '../../components/molecules/StatCard';
import { AppCard } from '../../components/atoms/AppCard';
import { postsApi } from '../../api/posts';
import { useAuth } from '../../contexts/AuthContext';

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
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await postsApi.getStats();
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                setError('Could not load dashboard statistics.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
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
            title: 'Pending/Scheduled',
            value: stats?.pendingPosts.toString() || '0',
            trend: 'Waiting in queue',
            trendColor: 'primary.main'
        },
    ];

    return (
        <Box>
            <Typography variant="h2" sx={{ mb: 4 }}>Welcome Back, {user?.email.split('@')[0]}!</Typography>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.title}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <AppCard sx={{ p: 4, height: '300px' }}>
                        <Typography variant="h3" sx={{ mb: 2 }}>System Overview</Typography>
                        {stats?.lastPost ? (
                            <Box>
                                <Typography variant="body1">Last post: <b>{stats.lastPost.title}</b></Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Posted at: {new Date(stats.lastPost.postedAt).toLocaleString()}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No posts made yet.</Typography>
                        )}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="body1">Next scheduled: <b>{new Date(stats?.nextScheduledPost || '').toLocaleString()}</b></Typography>
                        </Box>
                    </AppCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <AppCard sx={{ p: 4, height: '300px' }}>
                        <Typography variant="h3" sx={{ mb: 2 }}>Quick Status</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Your LinkedIn automation is currently <b>{stats?.pendingPosts ? 'Running' : 'Idle'}</b>.
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '8px' }}>
                            <Typography variant="caption" display="block">Failed Posts: {stats?.failedPosts}</Typography>
                            <Typography variant="caption" display="block">Pending Approval: 0</Typography>
                        </Box>
                    </AppCard>
                </Grid>
            </Grid>
        </Box>
    );
}
