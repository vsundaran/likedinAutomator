import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Stack, Chip, CircularProgress, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import MovieIcon from '@mui/icons-material/Movie';
import { AppCard } from '../../components/atoms/AppCard';
import { AppButton } from '../../components/atoms/AppButton';
import { postsApi } from '../../api/posts';
import { authApi } from '../../api/auth';
import { heygenApi } from '../../api/heygen';

interface Post {
    _id: string;
    title: string;
    content: string;
    status: 'pending' | 'success' | 'failed';
    imageUrl?: string;
    videoUrl?: string;
    scheduledFor: string;
    postedAt?: string;
}

export default function ContentPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoProgress, setVideoProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string | null>(null);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const [currentHeygenVideoId, setCurrentHeygenVideoId] = useState<string | null>(null);
    const pollInterval = useRef<any>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [postsRes, profileRes] = await Promise.all([
                postsApi.getPosts(),
                authApi.getProfile()
            ]);
            setPosts(postsRes.data.posts);
            setUserProfile(profileRes.data.user);

            // If there's a pending post without a videoUrl, start polling
            const pendingPost = postsRes.data.posts.find((p: any) => p.status === 'pending' && !p.videoUrl);
            if (pendingPost) {
                setCurrentPostId(pendingPost._id);
                // @ts-ignore
                setCurrentHeygenVideoId(pendingPost.heygenVideoId);
                startPolling();
            } else {
                // If there's an ongoing global status check needed, handle here
                // For now, only poll if we have a currentHeygenVideoId
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load content data.');
        } finally {
            setIsLoading(false);
        }
    };

    const checkVideoStatus = async () => {
        if (!currentHeygenVideoId) {
            // If no specific video is being tracked, fallback or stop
            return;
        }

        try {
            const res = await heygenApi.getStatus(currentHeygenVideoId);
            const statusData = res.data.data;

            if (statusData) {
                const url = statusData.video_url || statusData.motion_preview_url;
                if (url) {
                    setVideoUrl(url);
                }

                if (statusData.status === 'completed') {
                    setVideoProgress(100);
                    setGenerationStatus('Video ready!');

                    // Update the post on the server if we have a current post being tracked
                    if (currentPostId && url) {
                        try {
                            await postsApi.updatePost(currentPostId, {
                                videoUrl: url,
                                status: 'success'
                            });
                            // Refresh posts list to reflect changes in history table
                            const postsRes = await postsApi.getPosts();
                            setPosts(postsRes.data.posts);
                        } catch (e) {
                            console.error('Failed to save video to post:', e);
                        }
                    }

                    stopPolling();
                } else if (statusData.status === 'failed') {
                    setError('Video generation failed: ' + (statusData.error || statusData.message || 'Unknown error'));
                    stopPolling();
                } else if (statusData.status === 'processing' || statusData.status === 'pending' || statusData.status === 'waiting') {
                    setGenerationStatus(`Processing video... ${Math.round(videoProgress)}%`);
                    // Polling continues as long as interval exists
                }
            }
        } catch (err) {
            console.error('Failed to check video status:', err);
        }
    };

    const startPolling = () => {
        if (pollInterval.current) return;
        pollInterval.current = setInterval(checkVideoStatus, 3000);
    };

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
            setCurrentPostId(null);
            setCurrentHeygenVideoId(null);
        }
    };

    // Smooth progress simulation effect
    useEffect(() => {
        let timer: any;
        if (pollInterval.current && videoProgress < 100) {
            timer = setInterval(() => {
                setVideoProgress(prev => {
                    if (prev >= 98) return prev;
                    const increment = (100 - prev) / 60;
                    return prev + increment;
                });
            }, 300);
        }
        return () => clearInterval(timer);
    }, [pollInterval.current, videoProgress]);

    useEffect(() => {
        fetchData();
        return () => stopPolling();
    }, []);

    const handleManualPost = async () => {
        setIsPosting(true);
        setGenerationStatus('Picking topic & generating script...');
        setError(null);
        setVideoProgress(0);
        try {
            const res = await postsApi.createManualPost({});
            console.log('Manual post created with video initiation:', res.data);
            // Immediately update the posts list with the new pending post
            setPosts(prev => [res.data.post, ...prev]);
            setCurrentPostId(res.data.post._id);
            setCurrentHeygenVideoId(res.data.videoId);

            setGenerationStatus('Script generated! Starting video generation...');
            setVideoProgress(15); // Start at 15% after script is ready

            // Start polling for video progress
            startPolling();
        } catch (err: any) {
            console.error('Failed to create manual post:', err);
            setError(err.response?.data?.message || 'Failed to create post.');
            setGenerationStatus(null);
        } finally {
            setIsPosting(false);
        }
    };

    const handleGenerateVideo = async () => {
        setIsGeneratingVideo(true);
        setError(null);
        setVideoProgress(0);
        setGenerationStatus('Initiating motion video...');
        try {
            await heygenApi.addMotion({
                prompt: "A natural, breathing motion with a subtle smile",
                motion_type: "consistent"
            });
            startPolling();
        } catch (err: any) {
            console.error('Failed to generate video:', err);
            setError(err.response?.data?.message || 'Failed to initiate video generation.');
            setIsGeneratingVideo(false);
            setGenerationStatus(null);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }


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
                        {/* Top Section: Active Generation Preview */}
                        <Grid item xs={12}>
                            <AppCard sx={{ mb: 2, p: 4 }}>
                                <Grid container spacing={4} alignItems="center">
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            {videoUrl ? (
                                                <Box sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden', mb: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                                    <video
                                                        src={videoUrl}
                                                        controls
                                                        autoPlay
                                                        style={{ width: '100%', display: 'block' }}
                                                        muted={videoProgress < 100}
                                                        playsInline
                                                    />
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    width: '100%',
                                                    aspectRatio: '16/9',
                                                    bgcolor: 'black',
                                                    borderRadius: '12px',
                                                    mb: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    p: 2
                                                }}>
                                                    {pollInterval.current ? (
                                                        <>
                                                            <CircularProgress color="inherit" size={40} sx={{ mb: 2 }} />
                                                            <Typography variant="body2">{generationStatus}</Typography>
                                                            <Box sx={{ width: '100%', mt: 2 }}>
                                                                <LinearProgress variant="determinate" value={videoProgress} sx={{ height: 10, borderRadius: 5 }} />
                                                            </Box>
                                                        </>
                                                    ) : (
                                                        <MovieIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h3" sx={{ mb: 1, fontSize: '24px' }}>
                                            {pollInterval.current ? 'Generating Your AI Video' : 'Ready to Create?'}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                            {pollInterval.current
                                                ? `We are currently crafting a video for: "${posts.find(p => p._id === currentPostId)?.title || posts[0].title}"`
                                                : "Generate engaging social media videos tailored to your niche in seconds."}
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <AppButton
                                                variant="contained"
                                                startIcon={<ContentPasteIcon />}
                                                onClick={handleManualPost}
                                                disabled={isPosting || !!pollInterval.current}
                                            >
                                                {isPosting ? <CircularProgress size={20} /> : 'Generate New Content'}
                                            </AppButton>
                                            <AppButton
                                                variant="outlined"
                                                startIcon={<MovieIcon />}
                                                onClick={handleGenerateVideo}
                                                disabled={isGeneratingVideo || !!pollInterval.current}
                                            >
                                                {isGeneratingVideo ? <CircularProgress size={20} /> : 'Regenerate Video'}
                                            </AppButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </AppCard>
                        </Grid>

                        {/* Bottom Section: History Table */}
                        <Grid item xs={12}>
                            <Typography variant="h3" sx={{ mb: 2, fontSize: '20px', fontWeight: 700 }}>Video Generation History</Typography>
                            <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Script</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="center">Video Preview / Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {posts.map((post, index) => (
                                            <TableRow key={post._id} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 600, minWidth: '150px' }}>{post.title}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{
                                                        maxWidth: '400px',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        color: 'text.secondary'
                                                    }}>
                                                        {post.content}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {post.videoUrl ? (
                                                        <Box sx={{ width: '120px', height: '68px', borderRadius: '8px', overflow: 'hidden', mx: 'auto', border: '1px solid rgba(0,0,0,0.1)' }}>
                                                            <video src={post.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </Box>
                                                    ) : (
                                                        post._id === currentPostId ? (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                                <CircularProgress size={20} />
                                                                <Typography variant="caption" fontWeight={700} color="primary">
                                                                    {Math.round(videoProgress)}%
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Chip label="Queued" size="small" variant="outlined" />
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12}>
                        <AppCard sx={{ p: 6, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {isPosting || pollInterval.current
                                    ? generationStatus || 'Initializing generation...'
                                    : 'No content generated yet. Start by generating your first post!'}
                            </Typography>
                            {pollInterval.current && (
                                <Box sx={{ width: '300px', mx: 'auto', mb: 4 }}>
                                    <LinearProgress variant="determinate" value={videoProgress} />
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        {videoProgress}% complete
                                    </Typography>
                                </Box>
                            )}
                            <AppButton
                                variant="contained"
                                startIcon={<ContentPasteIcon />}
                                onClick={handleManualPost}
                                disabled={isPosting || !!pollInterval.current}
                            >
                                {isPosting ? <CircularProgress size={20} /> : 'Generate First Post'}
                            </AppButton>
                        </AppCard>
                    </Grid>
                )}
            </Grid>

            <AppButton variant="contained" onClick={handleManualPost} sx={{ mt: 2 }}>Generate Next Post</AppButton>
        </Box>
    );
}

