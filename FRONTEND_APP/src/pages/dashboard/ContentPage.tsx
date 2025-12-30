import { Box, Typography, Grid, Stack, Chip } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppCard } from '../../components/atoms/AppCard';
import { AppButton } from '../../components/atoms/AppButton';
import { dummyPosts, upcomingPosts } from '../../data/dummyPosts';

export default function ContentPage() {
    const currentPost = dummyPosts[0];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2">AI Content Dashboard</Typography>
                <Chip label="Niche: Tech Gadgets" color="primary" variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }} />
            </Box>

            <Grid container spacing={4}>
                {/* Left: Product Card & Actions */}
                <Grid item xs={12} md={4}>
                    <AppCard sx={{ mb: 3 }}>
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
                                sx={{ width: '100%', borderRadius: '12px', mb: 3 }}
                            />
                            <Typography variant="h3" sx={{ fontSize: '18px', mb: 1 }}>{currentPost.title}</Typography>
                            <Typography variant="h2" color="primary" sx={{ fontSize: '24px', mb: 2 }}>{currentPost.price}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Rating: {currentPost.rating} ⭐ ({currentPost.reviews} reviews)
                                <br />
                                Your Affiliate Link:
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                                    https://amzn.to/AffilAI-{currentPost.id}
                                </Box>
                            </Typography>
                            <Stack spacing={2}>
                                <AppButton variant="contained" fullWidth startIcon={<ContentPasteIcon />}>Post Now</AppButton>
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
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                                "🎧 Level up your audio experience with the new {currentPost.title}! Immerse yourself in pure sound, block out distractions, and enjoy unparalleled comfort all day long.
                                {"\n\n"}
                                ✨ Perfect for work, travel, or just chilling out. Get yours now and transform your listening journey!
                                {"\n\n"}
                                🔗 Shop on Amazon via my link: https://amzn.to/AffilAI-{currentPost.id}
                                {"\n\n"}
                                #AffiliateMarketing #TechGadgets #Earbuds #NoiseCancelling #AudioPerfection"
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Chip label="Draft" size="small" />
                            <Chip label="Amazon Product" size="small" />
                            <Chip label="Social Media Ready" size="small" />
                        </Stack>
                    </AppCard>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <AppCard sx={{ p: 3 }}>
                                <Typography variant="h3" sx={{ fontSize: '16px', mb: 2 }}>Upcoming Scheduled Posts</Typography>
                                <Stack spacing={2}>
                                    {upcomingPosts.map((post, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{post.platform}</Typography>
                                                <Typography variant="caption" color="text.secondary">{post.time}</Typography>
                                            </Box>
                                            <Chip label={post.status} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '10px' }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </AppCard>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <AppCard sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h3" sx={{ fontSize: '16px', mb: 2 }}>Content Insights & Quick Tips</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your "Tech Gadgets" niche is performing exceptionally well! Consider a short video review for the new Smartwatch X to boost engagement.
                                    <br /><br />
                                    Last week's clicks: <b>3,456</b> | Conversions: <b>8.2%</b>
                                </Typography>
                            </AppCard>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
