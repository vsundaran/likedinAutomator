import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, IconButton, AppBar, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Navbar } from '../components/organisms/Navbar';
import { Sidebar } from '../components/organisms/Sidebar';
import { Footer } from '../components/organisms/Footer';

const drawerWidth = 240;

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile Header */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    sx={{
                        width: '100%',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'none',
                        zIndex: theme.zIndex.drawer + 1
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src="/src/assets/logo.svg"
                            alt="Logo"
                            sx={{ height: 32 }}
                        />
                    </Toolbar>
                </AppBar>
            )}

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', lg: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                    >
                        <Sidebar onClose={handleDrawerToggle} />
                    </Drawer>
                ) : (
                    <Box
                        sx={{
                            display: { xs: 'none', lg: 'block' },
                            width: drawerWidth,
                            height: '100vh',
                            position: 'fixed',
                            borderRight: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Sidebar />
                    </Box>
                )}
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: { lg: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        bgcolor: 'background.default',
                        mt: isMobile ? 8 : 0 // Add margin for fixed AppBar on mobile
                    }}
                >
                    <Outlet />
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}
