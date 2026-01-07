import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid, Alert } from '@mui/material';
import { AppCard } from '../../atoms/AppCard';
import { AppButton } from '../../atoms/AppButton';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi } from '../../../api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function BankDetailsSection() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.bankDetails) {
            setFormData({
                accountNumber: user.bankDetails.accountNumber || '',
                ifscCode: user.bankDetails.ifscCode || '',
                accountHolderName: user.bankDetails.accountHolderName || '',
                bankName: user.bankDetails.bankName || ''
            });
        }
    }, [user]);

    const updateBankMutation = useMutation({
        mutationFn: (data: any) => authApi.updateBankDetails(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setSuccess('Bank details updated successfully');
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update bank details');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setError(null);
        updateBankMutation.mutate(formData);
    };

    return (
        <AppCard sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Bank Details</Typography>
                {!isEditing ? (
                    <AppButton onClick={() => setIsEditing(true)}>Edit</AppButton>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <AppButton variant="text" onClick={() => setIsEditing(false)}>Cancel</AppButton>
                        <AppButton
                            variant="contained"
                            onClick={handleSave}
                            disabled={updateBankMutation.isPending}
                        >
                            {updateBankMutation.isPending ? 'Saving...' : 'Save'}
                        </AppButton>
                    </Box>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Account Holder Name"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Bank Name"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Account Number"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="IFSC Code"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Grid>
            </Grid>
        </AppCard>
    );
}
