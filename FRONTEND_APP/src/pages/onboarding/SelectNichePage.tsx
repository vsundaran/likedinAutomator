import { useState } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../components/atoms/AppButton';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function SelectNichePage() {
    const navigate = useNavigate();
    const [nicheDescription, setNicheDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { updateUser } = useAuth();

    const handleContinue = async () => {
        if (!nicheDescription.trim()) return;

        setIsSubmitting(true);
        try {
            await authApi.updateNiche(nicheDescription);
            updateUser({ nicheDescription });
            navigate('/onboarding/socials');
        } catch (err) {
            console.error('Failed to update niche:', err);

            // Allow proceeding in DEV mode for testing UI flow even if backend save fails
            if (import.meta.env.DEV) {
                console.warn('Backend save failed, but allowing proceed in DEV mode.');
                updateUser({ nicheDescription });
                navigate('/onboarding/socials');
            } else {
                setError('Failed to save your description. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>Describe Your Niche</Typography>
                <Typography variant="body1" color="text.secondary">
                    Tell us what your content is about. Our AI will use this description to generate tailored videos and posts for you.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    placeholder="E.g., I want to create educational content about personal finance, focusing on stock market investing for beginners and saving tips for young professionals."
                    value={nicheDescription}
                    onChange={(e) => setNicheDescription(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            bgcolor: 'background.paper',
                            borderRadius: '12px',
                        }
                    }}
                />
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <AppButton
                    variant="contained"
                    size="large"
                    sx={{ px: 8 }}
                    disabled={!nicheDescription.trim() || isSubmitting}
                    onClick={handleContinue}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Continue'}
                </AppButton>
            </Box>
        </Container>
    );
}
