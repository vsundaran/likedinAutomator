import React from 'react';
import { Card } from '@mui/material';
import type { CardProps } from '@mui/material';

export interface AppCardProps extends CardProps {
    children: React.ReactNode;
}

export function AppCard({ children, ...props }: AppCardProps) {
    return (
        <Card {...props}>
            {children}
        </Card>
    );
}
