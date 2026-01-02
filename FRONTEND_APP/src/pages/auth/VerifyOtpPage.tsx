import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginMutation, useSignupMutation, useSendOtpMutation } from '../../hooks/useAuthHooks';

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: handleAuthLogin } = useAuth();

    // Get data passed from login/signup
    const { email, password, fullName, type } = location.state || {};

    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(false);

    const signupMutation = useSignupMutation();
    const loginMutation = useLoginMutation();
    const sendOtpMutation = useSendOtpMutation();

    const isPending = signupMutation.isPending || loginMutation.isPending || sendOtpMutation.isPending;

    useEffect(() => {
        if (!email || !type) {
            navigate('/login');
            return;
        }

        let interval: any;
        if (resendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((t) => t - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendDisabled(false);
            setTimer(60);
        }
        return () => clearInterval(interval);
    }, [resendDisabled, timer, email, type, navigate]);

    const getNextStep = (status: any) => {
        if (!status?.isNicheCompleted) return '/onboarding/niche';
        if (!status?.isSocialConnected) return '/onboarding/social';
        if (!status?.isBankDetailsCompleted) return '/onboarding/bank';
        return '/dashboard';
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (type === 'signup') {
            signupMutation.mutate({ fullName, email, password, otp }, {
                onSuccess: (response) => {
                    const { token, user, onboardingStatus } = response.data;
                    handleAuthLogin(token, user, onboardingStatus);
                    navigate(getNextStep(onboardingStatus));
                },
                onError: (err: any) => {
                    setError(err.response?.data?.message || 'Verification failed');
                }
            });
        } else if (type === 'login') {
            loginMutation.mutate({ email, password, otp }, {
                onSuccess: (response) => {
                    const { token, user, onboardingStatus } = response.data;
                    handleAuthLogin(token, user, onboardingStatus);
                    if (onboardingStatus) {
                        navigate(getNextStep(onboardingStatus));
                    } else {
                        navigate('/dashboard');
                    }
                },
                onError: (err: any) => {
                    setError(err.response?.data?.message || 'Verification failed');
                }
            });
        }
    };

    const handleResend = () => {
        setError(null);
        setResendDisabled(true);
        sendOtpMutation.mutate({ email, type }, {
            onSuccess: () => {
                setTimer(60);
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || 'Failed to resend OTP');
                setResendDisabled(false);
            }
        });
    };

    return (
        <AppCard sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
            <Stack spacing={3} component="form" onSubmit={handleVerify}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Verify Email</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter the 6-digit code sent to {email}
                    </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <AppInput
                    label="OTP Code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '4px', fontSize: '20px' } }}
                />

                <AppButton
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={isPending || otp.length < 6}
                >
                    {isPending ? <CircularProgress size={24} /> : 'Verify & Continue'}
                </AppButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Didn't receive the code?{' '}
                        <AppButton
                            variant="text"
                            size="small"
                            onClick={handleResend}
                            disabled={resendDisabled || isPending}
                            sx={{ minWidth: 'auto', p: 0, ml: 0.5, fontWeight: 600 }}
                        >
                            {resendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
                        </AppButton>
                    </Typography>
                </Box>
            </Stack>
        </AppCard>
    );
}
