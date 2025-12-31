import { useState } from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useNavigate } from 'react-router-dom';
import { SocialConnectCard } from '../../components/molecules/SocialConnectCard';
import { AppButton } from '../../components/atoms/AppButton';

const platforms = [
    {
        id: 'facebook',
        name: 'Facebook',
        icon: <FacebookIcon />,
        description: 'Post updates and engage with your Facebook community.'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: <InstagramIcon />,
        description: 'Share visual content and reach more followers on Instagram.'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: <LinkedInIcon />,
        description: 'Professional networking and B2B content distribution.'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: <YouTubeIcon />,
        description: 'Upload and manage your video content automatically.'
    },
];

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID';
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI || 'http://localhost:5173/auth/callback';

export default function ConnectSocialsPage() {
    const navigate = useNavigate();
    // In a real app, we would fetch the connection status from the backend
    const [connected, setConnected] = useState<string[]>([]);

    const handleConnect = (id: string) => {
        if (id === 'linkedin') {
            const scope = 'openid profile email w_member_social';
            const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=${scope}`;

            localStorage.setItem('social_connect_return_to', window.location.pathname);
            window.location.href = linkedinUrl;
        } else {
            // For other platforms, we just toggle for now as a mock
            setConnected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>Connect Your Social Media Accounts</Typography>
                <Typography variant="body1" color="text.secondary">
                    Link your platforms to enable automated content posting and reach your audience effortlessly.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {platforms.map((platform) => (
                    <Grid item xs={12} sm={6} key={platform.id}>
                        <SocialConnectCard
                            platform={platform.name}
                            icon={platform.icon}
                            description={platform.description}
                            isConnected={connected.includes(platform.id)}
                            onConnect={() => handleConnect(platform.id)}
                        />
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                <AppButton
                    variant="contained"
                    size="large"
                    sx={{ px: 8 }}
                    onClick={() => navigate('/onboarding/avatar')}
                >
                    Continue
                </AppButton>
            </Box>
        </Container>
    );
}
