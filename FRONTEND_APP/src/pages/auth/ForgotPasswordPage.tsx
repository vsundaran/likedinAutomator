import { useState } from 'react';
import { Box, Typography, Stack, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';
import { useForgotPasswordMutation } from '../../hooks/useAuthHooks';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const forgotPasswordMutation = useForgotPasswordMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        forgotPasswordMutation.mutate(email, {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 2000);
            },
            onError: (err: any) => {
                console.error('Forgot password request failed:', err);
                setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
            }
        });
    };

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Forgot Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter your email to receive a password reset code
                    </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">Reset code sent! Redirecting...</Alert>}

                <AppInput
                    label="Email Address"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <AppButton
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                >
                    {forgotPasswordMutation.isPending ? <CircularProgress size={24} /> : 'Send Reset Code'}
                </AppButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => navigate('/login')}
                        sx={{ fontWeight: 600 }}
                    >
                        Return to Login
                    </Link>
                </Box>
            </Stack>
        </AppCard>
    );
}
