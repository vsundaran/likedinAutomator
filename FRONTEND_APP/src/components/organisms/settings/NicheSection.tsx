import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { AppCard } from '../../atoms/AppCard';
import { AppButton } from '../../atoms/AppButton';
import { nicheApi } from '../../../api/niche';
import { authApi } from '../../../api/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Niche {
    _id: string;
    name: string;
    description: string;
    topics: string[];
}

export default function NicheSection() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all niches
    const { data: nichesResponse, isLoading: isLoadingNiches } = useQuery({
        queryKey: ['niches'],
        queryFn: () => nicheApi.getAll(),
    });

    const niches = nichesResponse?.data || [];

    // Mutation to update niche
    const updateNicheMutation = useMutation({
        mutationFn: (nicheId: string) => authApi.updateNiche(nicheId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditing(false);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update niche');
        }
    });

    useEffect(() => {
        if (user && user.nicheId) {
            // Depending on how nicheId is returned (populated object or string ID)
            const currentId = typeof user.nicheId === 'object' ? user.nicheId._id : user.nicheId;
            setSelectedNicheId(currentId);
        }
    }, [user]);

    const handleSave = () => {
        if (!selectedNicheId) return;
        updateNicheMutation.mutate(selectedNicheId);
    };

    const handleCancel = () => {
        if (user && user.nicheId) {
            const currentId = typeof user.nicheId === 'object' ? user.nicheId._id : user.nicheId;
            setSelectedNicheId(currentId);
        }
        setIsEditing(false);
    };

    // Find current niche name for display
    const currentNicheName = niches.find((n: Niche) => n._id === selectedNicheId)?.name || 'None selected';

    if (isLoadingNiches) {
        return <AppCard sx={{ p: 3 }}><CircularProgress /></AppCard>;
    }

    return (
        <AppCard sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Content Niche</Typography>
                {!isEditing ? (
                    <AppButton onClick={() => setIsEditing(true)}>Change Niche</AppButton>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <AppButton variant="text" onClick={handleCancel}>Cancel</AppButton>
                        <AppButton
                            variant="contained"
                            onClick={handleSave}
                            disabled={updateNicheMutation.isPending || !selectedNicheId}
                        >
                            {updateNicheMutation.isPending ? 'Saving...' : 'Save'}
                        </AppButton>
                    </Box>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!isEditing ? (
                <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{currentNicheName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {niches.find((n: Niche) => n._id === selectedNicheId)?.description}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {niches.map((niche: Niche) => (
                        <Grid item xs={12} sm={6} md={4} key={niche._id}>
                            <Box
                                onClick={() => setSelectedNicheId(niche._id)}
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: selectedNicheId === niche._id ? 'primary.main' : 'divider',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    bgcolor: selectedNicheId === niche._id ? 'rgba(91, 140, 255, 0.04)' : 'transparent',
                                    '&:hover': { borderColor: 'primary.main' }
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{niche.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                    {niche.description}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </AppCard>
    );
}
