import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Alert, CircularProgress, LinearProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppInput } from '../../components/atoms/AppInput';
import { AppButton } from '../../components/atoms/AppButton';
import { useResetPasswordMutation } from '../../hooks/useAuthHooks';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email: initialEmail } = location.state || {};

    const [email, setEmail] = useState(initialEmail || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [passwordValidity, setPasswordValidity] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    useEffect(() => {
        setPasswordValidity({
            length: newPassword.length >= 8,
            upper: /[A-Z]/.test(newPassword),
            lower: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[^A-Za-z0-9]/.test(newPassword)
        });
    }, [newPassword]);

    const isPasswordValid = Object.values(passwordValidity).every(Boolean);
    const strengthCount = Object.values(passwordValidity).filter(Boolean).length;
    const strengthColor = strengthCount <= 2 ? 'error' : strengthCount <= 4 ? 'warning' : 'success';
    const strengthLabel = strengthCount <= 2 ? 'Weak' : strengthCount <= 4 ? 'Medium' : 'Strong';

    const resetPasswordMutation = useResetPasswordMutation();

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordValid) return;
        setError(null);

        resetPasswordMutation.mutate({ email, otp, newPassword }, {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            },
            onError: (err: any) => {
                console.error('Password reset failed:', err);
                setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
            <Stack spacing={3} component="form" onSubmit={handleReset}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '24px', mb: 1 }}>Reset Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter the code and your new password
                    </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">Password reset successful! Redirecting to login...</Alert>}

                {!initialEmail && (
                    <AppInput
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}

                <AppInput
                    label="OTP Code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    inputProps={{ maxLength: 6 }}
                />

                <Box>
                    <AppInput
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    {newPassword && (
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

                <AppButton
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={resetPasswordMutation.isPending || !isPasswordValid || !otp || !email}
                >
                    {resetPasswordMutation.isPending ? <CircularProgress size={24} /> : 'Reset Password'}
                </AppButton>
            </Stack>
        </AppCard>
    );
}
