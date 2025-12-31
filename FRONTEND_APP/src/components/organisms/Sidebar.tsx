import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Content', icon: <PostAddIcon />, path: '/dashboard/content' },
    { text: 'Earnings', icon: <AccountBalanceWalletIcon />, path: '/dashboard/earnings' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/dashboard/analytics' },
];

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box
            sx={{
                width: 240,
                height: '100vh',
                borderRight: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 0,
                bgcolor: 'background.paper',
            }}
        >
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                <Box
                    component="img"
                    src={logo}
                    alt="AffiliateAI Logo"
                    sx={{
                        height: "100%",
                        maxWidth: "200px",
                        maxHeight: "50px",
                        objectFit: "cover",
                        width: "100%",
                        ml: "-22px"
                    }}
                />
            </Box>

            <List sx={{ flexGrow: 1, px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
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
                    <ListItemButton sx={{ borderRadius: '12px' }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>
            <List sx={{ px: 2, mb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ borderRadius: '12px', color: 'error.main' }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
}
