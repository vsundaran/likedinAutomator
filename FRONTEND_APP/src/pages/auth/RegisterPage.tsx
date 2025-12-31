import { useState } from 'react';
import { Box, Typography, Stack, Divider, Link, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.signup({ email, password });
            const { token, user } = response.data;
            login(token, user);
            navigate('/onboarding/niche');
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3} component="form" onSubmit={handleRegister}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Create Account</Typography>
                    <Typography variant="body2" color="text.secondary">Start your automated journey</Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

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
                    <AppInput
                        label="Email Address"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <AppInput
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Stack>

                <AppButton
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
                </AppButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link
                            component="button"
                            type="button"
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
