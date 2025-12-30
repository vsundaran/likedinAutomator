import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dummyStats } from '../../data/dummyStats';
import { dummyEarningsData, dummyPlatformData, platformPerformance } from '../../data/dummyCharts';
import { StatCard } from '../../components/molecules/StatCard';
import { AppCard } from '../../components/atoms/AppCard';

export default function AnalyticsPage() {
    return (
        <Box>
            <Typography variant="h2" sx={{ mb: 4 }}>Analytics & Earnings</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {dummyStats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.title}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <AppCard sx={{ p: 4, height: '400px' }}>
                        <Typography variant="h3" sx={{ fontSize: '18px', mb: 4 }}>Earnings Over Time</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dummyEarningsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="earnings" stroke="#5B8CFF" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </AppCard>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <AppCard sx={{ p: 4, height: '400px' }}>
                        <Typography variant="h3" sx={{ fontSize: '18px', mb: 4 }}>Clicks by Platform</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dummyPlatformData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="clicks" fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </AppCard>
                </Grid>

                <Grid item xs={12}>
                    <AppCard sx={{ p: 0 }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                            <Typography variant="h3" sx={{ fontSize: '18px' }}>Platform Performance Breakdown</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'background.default' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Earnings</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Clicks</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Conversions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {platformPerformance.map((row) => (
                                        <TableRow key={row.platform}>
                                            <TableCell>{row.platform}</TableCell>
                                            <TableCell align="right">{row.earnings}</TableCell>
                                            <TableCell align="right">{row.clicks}</TableCell>
                                            <TableCell align="right">{row.conversion}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AppCard>
                </Grid>
            </Grid>
        </Box>
    );
}
