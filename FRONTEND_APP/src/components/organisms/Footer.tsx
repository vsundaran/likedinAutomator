import { Box, Container, Typography, Stack, Link } from '@mui/material';

export function Footer() {
    return (
        <Box component="footer" sx={{ py: 6, mt: 'auto', borderTop: '1px solid #E5E7EB', bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        © 2025 AffiliateAI. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Link href="#" color="text.secondary" underline="hover">Privacy Policy</Link>
                        <Link href="#" color="text.secondary" underline="hover">Terms of Service</Link>
                        <Link href="#" color="text.secondary" underline="hover">Contact</Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
