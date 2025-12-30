import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AppCard } from '../../components/atoms/AppCard';
import { StatCard } from '../../components/molecules/StatCard';

export default function EarningsPage() {
    return (
        <Box>
            <Typography variant="h2" sx={{ mb: 4 }}>Payouts & Earnings</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatCard title="Available Balance" value="$3,450.00" trend="Ready for withdrawal" trendColor="primary.main" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Total Payouts" value="$12,345.67" trend="15 payouts processed" trendColor="text.secondary" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Pending Review" value="$240.50" trend="Usually processed in 24h" trendColor="warning.main" />
                </Grid>
            </Grid>

            <AppCard sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="h3" sx={{ fontSize: '18px' }}>Withdrawal History</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Oct 24, 2025</TableCell>
                                <TableCell>PayPal (john***@gmail.com)</TableCell>
                                <TableCell align="right">$1,200.00</TableCell>
                                <TableCell align="right"><Typography color="success.main" variant="body2" fontWeight={600}>Completed</Typography></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Sep 15, 2025</TableCell>
                                <TableCell>Bank Transfer (**** 4543)</TableCell>
                                <TableCell align="right">$2,450.50</TableCell>
                                <TableCell align="right"><Typography color="success.main" variant="body2" fontWeight={600}>Completed</Typography></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </AppCard>
        </Box>
    );
}
