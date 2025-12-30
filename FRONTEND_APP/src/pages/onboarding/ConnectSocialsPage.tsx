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
    { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, description: 'Post updates and engage with your Facebook community.' },
    { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, description: 'Share visual content and reach more followers on Instagram.' },
    { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon />, description: 'Professional networking and B2B content distribution.' },
    { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon />, description: 'Upload and manage your video content automatically.' },
];

export default function ConnectSocialsPage() {
    const navigate = useNavigate();
    const [connected, setConnected] = useState<string[]>([]);

    const toggleConnect = (id: string) => {
        setConnected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
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
                            onConnect={() => toggleConnect(platform.id)}
                        />
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                <AppButton
                    variant="contained"
                    size="large"
                    sx={{ px: 8 }}
                    disabled={connected.length === 0}
                    onClick={() => navigate('/onboarding/avatar')}
                >
                    Continue
                </AppButton>
            </Box>
        </Container>
    );
}
