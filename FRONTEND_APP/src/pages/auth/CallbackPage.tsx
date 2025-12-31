import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { socialApi } from '../../api/socials';

export default function CallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        // const state = searchParams.get('state'); // In case we use state for security

        if (code) {
            handleCallback(code);
        } else {
            setError('No authorization code found in the URL.');
        }
    }, [searchParams]);

    const handleCallback = async (code: string) => {
        try {
            await socialApi.exchangeLinkedInCode(code);
            // After successful connection, go back to onboarding socials or dashboard
            const returnTo = localStorage.getItem('social_connect_return_to') || '/onboarding/socials';
            localStorage.removeItem('social_connect_return_to');
            navigate(returnTo);
        } catch (err: any) {
            console.error('LinkedIn authentication failed:', err);
            setError(err.response?.data?.message || 'Failed to connect LinkedIn account.');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', p: 3 }}>
            {error ? (
                <>
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    <Typography
                        variant="body1"
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/onboarding/socials')}
                    >
                        Go back to socials
                    </Typography>
                </>
            ) : (
                <>
                    <CircularProgress sx={{ mb: 3 }} />
                    <Typography variant="h3">Connecting your account...</Typography>
                </>
            )}
        </Box>
    );
}
