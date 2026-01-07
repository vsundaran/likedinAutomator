import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
// import PostAddIcon from '@mui/icons-material/PostAdd';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
// import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';
import { useState } from 'react';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Social', icon: <ShareIcon />, path: '/dashboard/socials' },
    // { text: 'Content', icon: <PostAddIcon />, path: '/dashboard/content' },
    // { text: 'Earnings', icon: <AccountBalanceWalletIcon />, path: '/dashboard/earnings' },
    // { text: 'Analytics', icon: <BarChartIcon />, path: '/dashboard/analytics' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (onClose) onClose();
    };

    const handleLogoutClick = () => {
        setOpenLogoutDialog(true);
    };

    const handleLogoutConfirm = async () => {
        await logout();
        setOpenLogoutDialog(false);
        if (onClose) onClose();
        navigate('/login');
    };

    const handleLogoutClose = () => {
        setOpenLogoutDialog(false);
    };
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
            }}
        >
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', pt: isMobile ? 8 : 3 }}>

                {
                    !isMobile ? <Box
                        component="img"
                        src={logo}
                        alt="Vibe2EarnAI Logo"
                        sx={{
                            maxWidth: "80px",
                            objectFit: "cover",
                            width: "100%",
                        }}
                    /> : null
                }


            </Box>

            <Box sx={{ px: 3, pb: 2 }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {user?.fullName || 'User'}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {user?.email}
                </Typography>
            </Box>

            <Divider sx={{ mx: 2, mb: 2 }} />

            <List sx={{ flexGrow: 1, px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: '12px',
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    '& .MuiListItemIcon-root': { color: 'white' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'white' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />
            <List sx={{ px: 2, mb: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation('/dashboard/settings')}
                        selected={location.pathname === '/dashboard/settings'}
                        sx={{
                            borderRadius: '12px',
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                '& .MuiListItemIcon-root': { color: 'white' },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: location.pathname === '/dashboard/settings' ? 'white' : 'text.secondary' }}>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>
            <List sx={{ px: 2, mb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogoutClick}
                        sx={{ borderRadius: '12px', color: 'error.main' }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>

            <Dialog
                open={openLogoutDialog}
                onClose={handleLogoutClose}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '8px',
                    }
                }}
            >
                <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 600 }}>
                    Confirm Logout
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="logout-dialog-description">
                        Are you sure you want to log out? You will need to log in again to access your account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '16px', gap: 1 }}>
                    <Button
                        onClick={handleLogoutClose}
                        variant="outlined"
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        autoFocus
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
