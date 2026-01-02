import { Box, Typography, Stack, Divider, Link, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginMutation } from '../../hooks/useAuthHooks';
import { useState } from 'react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login: handleAuthLogin } = useAuth();
    const loginMutation = useLoginMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const getNextStep = (status: any) => {
        if (!status.isNicheCompleted) return '/onboarding/niche';
        if (!status.isSocialConnected) return '/onboarding/social';
        if (!status.isBankDetailsCompleted) return '/onboarding/bank';
        return '/dashboard';
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        loginMutation.mutate({ email, password }, {
            onSuccess: (response) => {
                const { token, user, onboardingStatus, requiresOTP } = response.data;
                if (requiresOTP) {
                    navigate('/verify-otp', { state: { email, password, type: 'login' } });
                    return;
                }
                handleAuthLogin(token, user, onboardingStatus);
                if (onboardingStatus) {
                    navigate(getNextStep(onboardingStatus));
                } else {
                    navigate('/dashboard');
                }
            },
            onError: (err: any) => {
                console.error('Login failed:', err);
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        });
    };

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3} component="form" onSubmit={handleLogin}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Welcome Back</Typography>
                    <Typography variant="body2" color="text.secondary">Enter your details to sign in</Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <AppButton disabled
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
                    <AppInput
                        label="Email Address"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Box>
                        <AppInput
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Box sx={{ textAlign: 'right', mt: 1 }}>
                            <Link
                                component="button"
                                type="button"
                                variant="body2"
                                color="primary"
                                underline="hover"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                    </Box>
                </Stack>

                <AppButton
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? <CircularProgress size={24} /> : 'Sign In'}
                </AppButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link
                            component="button"
                            type="button"
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
