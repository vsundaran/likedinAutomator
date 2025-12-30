import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from '../components/organisms/Navbar';
import { Sidebar } from '../components/organisms/Sidebar';
import { Footer } from '../components/organisms/Footer';

export function PublicLayout() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}

export function AuthLayout() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Outlet />
        </Box>
    );
}

export function DashboardLayout() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
                    <Outlet />
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}
