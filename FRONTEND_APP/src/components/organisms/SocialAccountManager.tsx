import { Box, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useState } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { SocialConnectCard } from '../molecules/SocialConnectCard';
import { useGetSocialAccountsQuery, useDisconnectSocialMutation } from '../../hooks/useSocialHooks';

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
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI || 'http://localhost:5173/auth/linkedin/callback';

export function SocialAccountManager() {
    const { data: accountsResponse, isLoading } = useGetSocialAccountsQuery();
    const disconnectMutation = useDisconnectSocialMutation();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [platformToDisconnect, setPlatformToDisconnect] = useState<string | null>(null);

    const connectedPlatforms = accountsResponse?.data?.map((acc: any) => acc.platform) || [];

    const handleConnect = (id: string) => {
        if (id === 'linkedin') {
            const scope = 'openid profile email w_member_social';
            const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=${scope}`;

            localStorage.setItem('social_connect_return_to', window.location.pathname);
            window.location.href = linkedinUrl;
        } else {
            console.log(`Connect for ${id} not implemented yet`);
        }
    };

    const handleDisconnectClick = (id: string) => {
        setPlatformToDisconnect(id);
        setConfirmOpen(true);
    };

    const handleConfirmDisconnect = () => {
        if (platformToDisconnect) {
            disconnectMutation.mutate(platformToDisconnect, {
                onSuccess: () => {
                    setConfirmOpen(false);
                    setPlatformToDisconnect(null);
                }
            });
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={3}>
                {platforms.map((platform) => (
                    <Grid item xs={12} sm={6} key={platform.id}>
                        <SocialConnectCard
                            platform={platform.name}
                            icon={platform.icon}
                            description={platform.description}
                            isConnected={connectedPlatforms.includes(platform.id)}
                            onConnect={() => handleConnect(platform.id)}
                            onDisconnect={() => handleDisconnectClick(platform.id)}
                        />
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            >
                <DialogTitle>Confirm Disconnect</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to disconnect your {platformToDisconnect} account?
                        You will need to reconnect it to post content to this platform.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDisconnect}
                        color="error"
                        variant="contained"
                        disabled={disconnectMutation.isPending}
                    >
                        {disconnectMutation.isPending ? <CircularProgress size={24} /> : 'Disconnect'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
