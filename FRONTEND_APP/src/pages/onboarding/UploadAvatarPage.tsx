import { useState, useRef } from 'react';
import { Box, Typography, Container, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppButton } from '../../components/atoms/AppButton';
import { authApi } from '../../api/auth';

const bestPractices = [
    'Clear frontal view of your face',
    'Good lighting and neutral background',
    'High resolution image (at least 512x512)',
    'No sunglasses or hats for best AI results',
];

export default function UploadAvatarPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gender, setGender] = useState<'male' | 'female'>('female');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('gender', gender);

        try {
            await authApi.updateAvatar(formData);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Failed to upload avatar. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>Upload Your AI Avatar</Typography>
                <Typography variant="body1" color="text.secondary">
                    Our AI will use this photo to generate consistent content featuring your likeness.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <AppCard sx={{ p: 4, mb: 4 }}>
                <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                    <FormLabel component="legend" sx={{ textAlign: 'left', mb: 1, fontWeight: 'bold', color: 'text.primary' }}>Select Your Gender</FormLabel>
                    <RadioGroup
                        row
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        sx={{ justifyContent: 'flex-start' }}
                    >
                        <FormControlLabel value="male" control={<Radio />} label="Male" />
                        <FormControlLabel value="female" control={<Radio />} label="Female" />
                    </RadioGroup>
                </FormControl>

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
                <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        py: 8,
                        px: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #E5E7EB',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(91, 140, 255, 0.02)' },
                    }}
                >
                    {previewUrl ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            sx={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', mb: 2 }}
                        />
                    ) : (
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    )}
                    <Typography variant="h3" sx={{ fontSize: '18px', mb: 1 }}>
                        {file ? file.name : 'Drag & Drop file here'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">or click to browse from your computer</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>Supported: JPG, PNG, WEBP (Max 5MB)</Typography>
                </Box>
            </AppCard>

            <AppCard sx={{ p: 4, bgcolor: 'background.default' }}>
                <Typography variant="h3" sx={{ fontSize: '16px', mb: 2 }}>Best Practices</Typography>
                <List dense>
                    {bestPractices.map((text) => (
                        <ListItem key={text} disableGutters>
                            <ListItemIcon sx={{ minWidth: 32, color: 'success.main' }}>
                                <CheckCircleOutlineIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
            </AppCard>

            <Box sx={{ mt: 6, textAlign: 'center' }}>
                <AppButton
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={!file || isLoading}
                    onClick={handleUpload}
                    sx={{ py: 2 }}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Continue to Dashboard'}
                </AppButton>
                <AppButton disabled
                    variant="text"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/dashboard')}
                >
                    Skip for now
                </AppButton>
            </Box>
        </Container>
    );
}
