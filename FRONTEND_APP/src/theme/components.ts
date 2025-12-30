import type { Components, Theme } from '@mui/material';

export const components: Components<Omit<Theme, 'components'>> = {
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: '12px',
                padding: '10px 24px',
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: 'none',
                },
            },
            containedPrimary: {
                backgroundColor: '#5B8CFF',
                '&:hover': {
                    backgroundColor: '#4A7BEF',
                },
            },
        },
        defaultProps: {
            disableElevation: true,
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: '16px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E5E7EB',
            },
        },
    },
    MuiTextField: {
        defaultProps: {
            variant: 'outlined',
            fullWidth: true,
        },
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                        borderColor: '#E5E7EB',
                    },
                    '&:hover fieldset': {
                        borderColor: '#5B8CFF',
                    },
                },
            },
        },
    },
};
