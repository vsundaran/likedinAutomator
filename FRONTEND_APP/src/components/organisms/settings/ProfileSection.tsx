import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';
import { AppCard } from '../../atoms/AppCard';
import { AppButton } from '../../atoms/AppButton';
import { useAuth } from '../../../contexts/AuthContext';
import { useUpdateProfileMutation } from '../../../hooks/useAuthHooks';

export default function ProfileSection() {
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const updateProfileMutation = useUpdateProfileMutation();

    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
        }
    }, [user]);

    const handleSave = () => {
        updateProfileMutation.mutate({ fullName }, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    return (
        <AppCard sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Personal Information</Typography>
                {!isEditing ? (
                    <AppButton onClick={() => setIsEditing(true)}>Edit</AppButton>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <AppButton variant="text" onClick={() => setIsEditing(false)}>Cancel</AppButton>
                        <AppButton variant="contained" onClick={handleSave} disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </AppButton>
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        value={user?.email || ''}
                        disabled
                        helperText="Email cannot be changed"
                    />
                </Grid>
            </Grid>
        </AppCard>
    );
}
