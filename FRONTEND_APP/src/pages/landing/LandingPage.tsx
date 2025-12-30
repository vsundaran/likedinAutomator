import { Box, Typography, Container, Grid, Stack } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SecurityIcon from '@mui/icons-material/Security';
import { AppButton } from '../../components/atoms/AppButton';
import { FeatureCard } from '../../components/molecules/FeatureCard';
import { AppCard } from '../../components/atoms/AppCard';

const features = [
    { title: 'Lightning Fast', description: 'Generate content in seconds with our optimized AI engine.', icon: <SpeedIcon /> },
    { title: 'AI Driven', description: 'Smart suggestions tailored to your niche and audience.', icon: <AutoAwesomeIcon /> },
    { title: 'Global Reach', description: 'Connect with audiences across all major social platforms.', icon: <PublicIcon /> },
    { title: 'Detailed Analytics', description: 'Track your growth with real-time performance insights.', icon: <BarChartIcon /> },
    { title: 'Maximize Earnings', description: 'Optimized conversion strategies for better ROI.', icon: <MonetizationOnIcon /> },
    { title: 'Secure & Private', description: 'Enterprise-grade security for your data and accounts.', icon: <SecurityIcon /> },
];

const testimonials = [
    { name: 'John Doe', role: 'Content Creator', content: 'This tool has doubled my affiliate income in just two months!' },
    { name: 'Jane Smith', role: 'Digital Marketer', content: 'The AI content generation is shockingly good. Saves me hours every day.' },
    { name: 'Mike Ross', role: 'Influencer', content: 'The best analytics dashboard I have ever used for affiliate tracking.' },
];

export default function LandingPage() {
    return (
        <Box>
            {/* Hero Section */}
            <Box sx={{ bgcolor: 'white', pt: 12, pb: 10 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography variant="h1" sx={{ mb: 3 }}>
                                Scale Your Affiliate Empire with <Box component="span" sx={{ color: 'primary.main' }}>AI</Box>
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '20px', mb: 5, maxWidth: '600px' }}>
                                The all-in-one platform for affiliate marketers. Automate content, track earnings, and grow your presence across all social channels.
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <AppButton variant="contained" size="large" sx={{ py: 2, px: 4 }}>
                                    Start Free Trial
                                </AppButton>
                                <AppButton variant="outlined" size="large" sx={{ py: 2, px: 4 }}>
                                    Book a Demo
                                </AppButton>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    bgcolor: 'background.default',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0px 20px 40px rgba(0,0,0,0.05)',
                                    border: '1px solid #E5E7EB',
                                }}
                            >
                                <AutoAwesomeIcon sx={{ fontSize: 120, color: 'primary.main', opacity: 0.2 }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Grid */}
            <Box sx={{ py: 12, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" align="center" sx={{ mb: 8 }}>
                        Powerful Features for Modern Marketers
                    </Typography>
                    <Grid container spacing={3}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <FeatureCard {...feature} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials */}
            <Box sx={{ py: 12, bgcolor: 'white' }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" align="center" sx={{ mb: 8 }}>
                        Trusted by Thousands
                    </Typography>
                    <Grid container spacing={4}>
                        {testimonials.map((t, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <AppCard sx={{ p: 4, height: '100%', bgcolor: 'background.default' }}>
                                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                                        "{t.content}"
                                    </Typography>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontSize: '18px' }}>{t.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{t.role}</Typography>
                                    </Box>
                                </AppCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Banner */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            borderRadius: '24px',
                            p: 6,
                            textAlign: 'center',
                            color: 'white',
                            boxShadow: '0px 10px 30px rgba(91, 140, 255, 0.3)',
                        }}
                    >
                        <Typography variant="h2" sx={{ color: 'white', mb: 3 }}>
                            Ready to automate your growth?
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 5, opacity: 0.9 }}>
                            Join 5,000+ creators scaling their business today.
                        </Typography>
                        <AppButton
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                px: 6,
                                py: 2,
                                '&:hover': { bgcolor: '#f0f0f0' },
                            }}
                        >
                            Get Started for Free
                        </AppButton>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
