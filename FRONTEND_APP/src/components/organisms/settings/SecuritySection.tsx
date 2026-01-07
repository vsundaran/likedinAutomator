import { useState } from 'react';
import { Box, Typography, TextField, Alert, Grid } from '@mui/material';
import { AppCard } from '../../atoms/AppCard';
import { AppButton } from '../../atoms/AppButton';
import { useChangePasswordMutation, useSendOtpMutation } from '../../../hooks/useAuthHooks';
import { useAuth } from '../../../contexts/AuthContext';

export default function SecuritySection() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        otp: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    const changePasswordMutation = useChangePasswordMutation();
    const sendOtpMutation = useSendOtpMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = () => {
        setError(null);
        setSuccess(null);
        if (!user?.email) {
            setError('User email not found');
            return;
        }

        sendOtpMutation.mutate({ email: user.email, type: 'change_password' }, {
            onSuccess: () => {
                setOtpSent(true);
                setSuccess('OTP sent to your email');
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || 'Failed to send OTP');
            }
        });
    };

    const validateForm = () => {
        if (!formData.oldPassword) {
            setError('Current password is required');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return false;
        }
        if (!/[0-9]/.test(formData.newPassword)) {
            setError('New password must contain at least one number');
            return false;
        }
        if (!/[!@#$%^&*]/.test(formData.newPassword)) {
            setError('New password must contain at least one special character (!@#$%^&*)');
            return false;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('New passwords do not match');
            return false;
        }
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        setError(null);
        setSuccess(null);

        if (!validateForm()) return;

        changePasswordMutation.mutate({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
            otp: formData.otp
        }, {
            onSuccess: () => {
                setSuccess('Password changed successfully');
                setFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                    otp: ''
                });
                setOtpSent(false);
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || 'Failed to change password');
            }
        });
    };

    return (
        <AppCard sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box sx={{ maxWidth: 500 }}>
                <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="OTP"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit OTP"
                        disabled={!otpSent}
                    />
                    <AppButton
                        variant="outlined"
                        onClick={handleSendOtp}
                        disabled={sendOtpMutation.isPending || otpSent}
                        sx={{ minWidth: '120px' }}
                    >
                        {sendOtpMutation.isPending ? 'Sending...' : (otpSent ? 'Sent' : 'Get OTP')}
                    </AppButton>
                </Box>

                <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    helperText="Min 8 chars, 1 number, 1 special char"
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                />
                <AppButton
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={changePasswordMutation.isPending || !otpSent}
                >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </AppButton>
            </Box>
        </AppCard>
    );
}
