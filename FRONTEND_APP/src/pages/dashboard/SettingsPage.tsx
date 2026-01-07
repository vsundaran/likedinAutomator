import { Container, Typography, Box } from '@mui/material';
import ProfileSection from '../../components/organisms/settings/ProfileSection';
import AvatarSection from '../../components/organisms/settings/AvatarSection';
import NicheSection from '../../components/organisms/settings/NicheSection';
import BankDetailsSection from '../../components/organisms/settings/BankDetailsSection';
import SecuritySection from '../../components/organisms/settings/SecuritySection';

export default function SettingsPage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Settings</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your account settings and preferences.
                </Typography>
            </Box>

            <ProfileSection />
            <AvatarSection />
            <NicheSection />
            <BankDetailsSection />
            <SecuritySection />
        </Container>
    );
}
