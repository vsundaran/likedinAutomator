import { Box, Typography, Container, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppButton } from '../../components/atoms/AppButton';

const bestPractices = [
    'Clear frontal view of your face',
    'Good lighting and neutral background',
    'High resolution image (at least 512x512)',
    'No sunglasses or hats for best AI results',
];

export default function UploadAvatarPage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>Upload Your AI Avatar</Typography>
                <Typography variant="body1" color="text.secondary">
                    Our AI will use this photo to generate consistent content featuring your likeness.
                </Typography>
            </Box>

            <AppCard sx={{ p: 0, mb: 4 }}>
                <Box
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
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h3" sx={{ fontSize: '18px', mb: 1 }}>Drag & Drop file here</Typography>
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
                    disabled
                    sx={{ py: 2 }}
                >
                    Continue to Dashboard
                </AppButton>
                <AppButton
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
