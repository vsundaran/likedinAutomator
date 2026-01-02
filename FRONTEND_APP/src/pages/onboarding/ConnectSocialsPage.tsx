import { Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../components/atoms/AppButton';
import { SocialAccountManager } from '../../components/organisms/SocialAccountManager';
import { useGetSocialAccountsQuery } from '../../hooks/useSocialHooks';

export default function ConnectSocialsPage() {
    const navigate = useNavigate();
    const { data: accountsResponse } = useGetSocialAccountsQuery();
    const connectedPlatforms = accountsResponse?.data?.map((acc: any) => acc.platform) || [];

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>Connect Your Social Media Accounts</Typography>
                <Typography variant="body1" color="text.secondary">
                    Link your platforms to enable automated content posting and reach your audience effortlessly.
                </Typography>
            </Box>

            <SocialAccountManager />

            <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                <AppButton
                    disabled={connectedPlatforms.length === 0}
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
