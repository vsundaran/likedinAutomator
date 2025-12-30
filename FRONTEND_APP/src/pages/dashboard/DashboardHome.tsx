import { Box, Typography, Grid } from '@mui/material';
import { dummyStats } from '../../data/dummyStats';
import { StatCard } from '../../components/molecules/StatCard';
import { AppCard } from '../../components/atoms/AppCard';

export default function DashboardHome() {
    return (
        <Box>
            <Typography variant="h2" sx={{ mb: 4 }}>Welcome Back, User!</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {dummyStats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.title}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <AppCard sx={{ p: 4, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1" color="text.secondary">Dashboard overview content will appear here.</Typography>
                    </AppCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <AppCard sx={{ p: 4, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1" color="text.secondary">Quick actions & notifications.</Typography>
                    </AppCard>
                </Grid>
            </Grid>
        </Box>
    );
}
