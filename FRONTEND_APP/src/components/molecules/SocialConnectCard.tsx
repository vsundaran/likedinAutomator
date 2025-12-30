import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { AppCard } from '../atoms/AppCard';
import { AppButton } from '../atoms/AppButton';

interface SocialConnectCardProps {
    platform: string;
    icon: React.ReactNode;
    description: string;
    isConnected?: boolean;
    onConnect?: () => void;
}

export function SocialConnectCard({ platform, icon, description, isConnected, onConnect }: SocialConnectCardProps) {
    return (
        <AppCard sx={{ p: 3, textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
                <Box sx={{ color: 'primary.main', '& svg': { fontSize: 48 } }}>
                    {icon}
                </Box>
                <Typography variant="h3" sx={{ fontSize: '20px' }}>
                    {platform}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                    {description}
                </Typography>
                <AppButton
                    variant={isConnected ? 'outlined' : 'contained'}
                    fullWidth
                    onClick={onConnect}
                    sx={{ borderRadius: '8px' }}
                >
                    {isConnected ? 'Connected' : 'Connect'}
                </AppButton>
            </Stack>
        </AppCard>
    );
}
