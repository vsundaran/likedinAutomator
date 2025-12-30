import React from 'react';
import { Box, Typography } from '@mui/material';
import { AppCard } from '../atoms/AppCard';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendColor?: string;
}

export function StatCard({ title, value, icon, trend, trendColor }: StatCardProps) {
    return (
        <AppCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {title}
                </Typography>
                {icon && <Box sx={{ color: 'primary.main' }}>{icon}</Box>}
            </Box>
            <Typography variant="h3" sx={{ mb: 1 }}>
                {value}
            </Typography>
            {trend && (
                <Typography variant="body2" sx={{ color: trendColor || 'success.main', fontWeight: 600 }}>
                    {trend}
                </Typography>
            )}
        </AppCard>
    );
}
