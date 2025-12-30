import React from 'react';
import { Box, Typography } from '@mui/material';
import { AppCard } from '../atoms/AppCard';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <AppCard sx={{ p: 4, textAlign: 'center', height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <Box sx={{ mb: 3, color: 'primary.main', display: 'flex', justifyContent: 'center', '& svg': { fontSize: 40 } }}>
                {icon}
            </Box>
            <Typography variant="h3" sx={{ fontSize: '20px', mb: 2 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </AppCard>
    );
}
