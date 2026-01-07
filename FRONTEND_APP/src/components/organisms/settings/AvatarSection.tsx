import { useState, useRef } from 'react';
import { Box, Typography, Avatar, CircularProgress, Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AppCard } from '../../atoms/AppCard';
import { AppButton } from '../../atoms/AppButton';
import { useAuth } from '../../../contexts/AuthContext';
import { useUpdateAvatarMutation } from '../../../hooks/useAuthHooks';

export default function AvatarSection() {
    const { user } = useAuth();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateAvatarMutation = useUpdateAvatarMutation();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleUpload = () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('gender', gender);

        updateAvatarMutation.mutate(formData, {
            onSuccess: () => {
                setFile(null);
                setPreviewUrl(null);
                setError(null);
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || 'Failed to upload avatar');
            }
        });
    };

    const handleCancel = () => {
        setFile(null);
        setPreviewUrl(null);
        setError(null);
    };

    // Construct avatar URL properly
    const avatarSrc = previewUrl || (user?.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : undefined);

    return (
        <AppCard sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Avatar Settings</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={avatarSrc}
                        sx={{ width: 100, height: 100 }}
                    >
                        {user?.fullName?.charAt(0)}
                    </Avatar>
                </Box>

                <Box sx={{ flex: 1 }}>
                    {file ? (
                        <Box>
                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                                <FormLabel component="legend">Gender (for HeyGen)</FormLabel>
                                <RadioGroup
                                    row
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                                >
                                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                                </RadioGroup>
                            </FormControl>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <AppButton
                                    variant="contained"
                                    onClick={handleUpload}
                                    disabled={updateAvatarMutation.isPending}
                                >
                                    {updateAvatarMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Confirm Upload'}
                                </AppButton>
                                <AppButton variant="outlined" color="secondary" onClick={handleCancel} disabled={updateAvatarMutation.isPending}>
                                    Cancel
                                </AppButton>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Upload a new avatar to update your profile picture.
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <AppButton
                                startIcon={<CloudUploadIcon />}
                                variant="outlined"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload New Picture
                            </AppButton>
                        </Box>
                    )}
                </Box>
            </Box>
        </AppCard>
    );
}
