import { Box, Typography, Stack, Divider, Link } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';

export default function LoginPage() {
    const navigate = useNavigate();

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Welcome Back</Typography>
                    <Typography variant="body2" color="text.secondary">Enter your details to sign in</Typography>
                </Box>

                <AppButton
                    variant="outlined"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    sx={{ py: 1.5, borderColor: '#E5E7EB', color: 'text.primary' }}
                >
                    Sign in with Google
                </AppButton>

                <Divider>
                    <Typography variant="body2" color="text.secondary">OR</Typography>
                </Divider>

                <Stack spacing={2}>
                    <AppInput label="Email Address" placeholder="name@company.com" />
                    <Box>
                        <AppInput label="Password" type="password" placeholder="••••••••" />
                        <Box sx={{ textAlign: 'right', mt: 1 }}>
                            <Link href="#" variant="body2" color="primary" underline="hover">Forgot password?</Link>
                        </Box>
                    </Box>
                </Stack>

                <AppButton variant="contained" fullWidth size="large" onClick={() => navigate('/dashboard')}>
                    Sign In
                </AppButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/register')}
                            sx={{ fontWeight: 600 }}
                        >
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Stack>
        </AppCard>
    );
}
