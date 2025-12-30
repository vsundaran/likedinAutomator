import React from 'react';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';

export interface AppButtonProps extends ButtonProps {
    children: React.ReactNode;
}

export function AppButton({ children, ...props }: AppButtonProps) {
    return (
        <Button {...props}>
            {children}
        </Button>
    );
}
