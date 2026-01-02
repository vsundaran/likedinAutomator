import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Divider, Link, Alert, CircularProgress, LinearProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useSendOtpMutation } from '../../hooks/useAuthHooks';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login: _login } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const sendOtpMutation = useSendOtpMutation();

    const [passwordValidity, setPasswordValidity] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    useEffect(() => {
        setPasswordValidity({
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        });
    }, [password]);

    const isPasswordValid = Object.values(passwordValidity).every(Boolean);
    const strengthCount = Object.values(passwordValidity).filter(Boolean).length;
    const strengthColor = strengthCount <= 2 ? 'error' : strengthCount <= 4 ? 'warning' : 'success';
    const strengthLabel = strengthCount <= 2 ? 'Weak' : strengthCount <= 4 ? 'Medium' : 'Strong';

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordValid) return;
        setError(null);

        sendOtpMutation.mutate({ email, type: 'signup' }, {
            onSuccess: () => {
                navigate('/verify-otp', { state: { email, password, fullName, type: 'signup' } });
            },
            onError: (err: any) => {
                console.error('Registration OTP failed:', err);
                setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
            }
        });
    };

    const ValidationItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
        <Stack direction="row" spacing={1} alignItems="center">
            {isValid ? (
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: '14px' }} />
            ) : (
                <ErrorOutlineIcon color="disabled" sx={{ fontSize: '14px' }} />
            )}
            <Typography variant="caption" color={isValid ? 'success.main' : 'text.disabled'}>
                {label}
            </Typography>
        </Stack>
    );

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3} component="form" onSubmit={handleRegister}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Create Account</Typography>
                    <Typography variant="body2" color="text.secondary">Start your automated journey</Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <AppButton disabled
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
                        label="Full Name"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
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
                        {password && (
                            <Box sx={{ mt: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" fontWeight={600} color={`${strengthColor}.main`}>
                                        Strength: {strengthLabel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {strengthCount}/5
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={(strengthCount / 5) * 100}
                                    color={strengthColor}
                                    sx={{ height: 4, borderRadius: 2, mb: 1.5 }}
                                />
                                <Stack spacing={0.5}>
                                    <ValidationItem label="Minimum 8 characters" isValid={passwordValidity.length} />
                                    <ValidationItem label="One uppercase letter" isValid={passwordValidity.upper} />
                                    <ValidationItem label="One lowercase letter" isValid={passwordValidity.lower} />
                                    <ValidationItem label="One number" isValid={passwordValidity.number} />
                                    <ValidationItem label="One special character" isValid={passwordValidity.special} />
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>

                <AppButton
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={sendOtpMutation.isPending || !isPasswordValid || !fullName || !email}
                >
                    {sendOtpMutation.isPending ? <CircularProgress size={24} /> : 'Create Account'}
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
