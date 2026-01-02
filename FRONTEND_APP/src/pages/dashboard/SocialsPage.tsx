import { Container, Typography, Box } from '@mui/material';
import { SocialAccountManager } from '../../components/organisms/SocialAccountManager';

export default function SocialsPage() {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h2" sx={{ mb: 1 }}>Social Accounts</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your connected social media platforms and automation settings.
                </Typography>
            </Box>
            <Container maxWidth="lg">
                <SocialAccountManager />
            </Container>
        </Box>
    );
}
