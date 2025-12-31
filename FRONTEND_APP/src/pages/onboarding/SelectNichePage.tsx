import { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../../components/atoms/AppCard';
import { AppButton } from '../../components/atoms/AppButton';
import { nicheApi } from '../../api/niche';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

interface Niche {
    _id: string;
    name: string;
    description: string;
    topics: string[];
}

export default function SelectNichePage() {
    const navigate = useNavigate();
    const [niches, setNiches] = useState<Niche[]>([]);
    const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNiches = async () => {
            try {
                const response = await nicheApi.getAll();
                if (response.data && response.data.length > 0) {
                    setNiches(response.data);
                } else {
                    throw new Error('No niches found');
                }
            } catch (err) {
                console.error('Failed to fetch niches:', err);
                // Fallback for development/demonstration if DB is not connected
                if (import.meta.env.DEV) {
                    setNiches([
                        { _id: '1', name: 'Fitness', description: 'Health, workout, and wellness content.', topics: ['Workout', 'Nutrition'] },
                        { _id: '2', name: 'Education', description: 'Learning, tutorials, and academic content.', topics: ['Study Tips', 'Tutorials'] },
                        { _id: '3', name: 'Tech', description: 'Software, gadgets, and industry news.', topics: ['AI', 'Programming'] },
                        { _id: '4', name: 'Finance', description: 'Personal finance, investing, and market news.', topics: ['Stocks', 'Crypto'] },
                    ]);
                    setError('Using demonstration data. Please ensure your backend database is connected for live data.');
                } else {
                    setError('Failed to load niches. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchNiches();
    }, []);

    const { updateUser } = useAuth();

    const handleContinue = async () => {
        if (!selectedNiche) return;

        setIsSubmitting(true);
        try {
            await authApi.updateNiche(selectedNiche);
            updateUser({ nicheId: selectedNiche });
            navigate('/onboarding/socials');
        } catch (err) {
            console.error('Failed to update niche:', err);

            // Allow proceeding in DEV mode for testing UI flow even if backend save fails
            if (import.meta.env.DEV) {
                console.warn('Backend save failed, but allowing proceed in DEV mode.');
                updateUser({ nicheId: selectedNiche });
                navigate('/onboarding/socials');
            } else {
                setError('Failed to save your selection. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>Choose Your Niche</Typography>
                <Typography variant="body1" color="text.secondary">
                    Select the area you want to focus on. Our AI will generate content tailored to this niche.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {niches.map((niche) => (
                    <Grid item xs={12} sm={6} key={niche._id}>
                        <AppCard
                            onClick={() => setSelectedNiche(niche._id)}
                            sx={{
                                p: 3,
                                cursor: 'pointer',
                                height: '100%',
                                border: selectedNiche === niche._id ? '2px solid' : '1px solid',
                                borderColor: selectedNiche === niche._id ? 'primary.main' : 'divider',
                                '&:hover': { borderColor: 'primary.main' },
                                transition: 'all 0.2s'
                            }}
                        >
                            <Typography variant="h3" sx={{ fontSize: '18px', mb: 1 }}>{niche.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {niche.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {niche.topics.map((topic, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            bgcolor: 'rgba(91, 140, 255, 0.1)',
                                            color: 'primary.main',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {topic}
                                    </Box>
                                ))}
                            </Box>
                        </AppCard>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                <AppButton
                    variant="contained"
                    size="large"
                    sx={{ px: 8 }}
                    disabled={!selectedNiche || isSubmitting}
                    onClick={handleContinue}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Continue'}
                </AppButton>
            </Box>
        </Container>
    );
}
