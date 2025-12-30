import { Box, Typography, Stack, Divider, Link } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';

export default function RegisterPage() {
    const navigate = useNavigate();

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Create Account</Typography>
                    <Typography variant="body2" color="text.secondary">Start your 14-day free trial</Typography>
                </Box>

                <AppButton
                    variant="outlined"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    sx={{ py: 1.5, borderColor: '#E5E7EB', color: 'text.primary' }}
                >
                    Sign up with Google
                </AppButton>

                <Divider>
                    <Typography variant="body2" color="text.secondary">OR</Typography>
                </Divider>

                <Stack spacing={2}>
                    <AppInput label="Full Name" placeholder="John Doe" />
                    <AppInput label="Email Address" placeholder="name@company.com" />
                    <AppInput label="Password" type="password" placeholder="••••••••" />
                </Stack>

                <AppButton variant="contained" fullWidth size="large" onClick={() => navigate('/onboarding/socials')}>
                    Create Account
                </AppButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/login')}
                            sx={{ fontWeight: 600 }}
                        >
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Stack>
        </AppCard>
    );
}
