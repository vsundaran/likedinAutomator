import { AppBar, Toolbar, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../atoms/AppButton';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #E5E7EB' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Vibe2EarnAI Logo"
                            sx={{
                                height: "100%",
                                maxWidth: "200px",
                                maxHeight: "50px",
                                objectFit: "cover",
                                width: "100%",
                                // minWidth: "180px"
                            }}
                        />

                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {!isAuthenticated ? (
                            <>
                                <AppButton color="inherit" onClick={() => navigate('/login')}>
                                    Login
                                </AppButton>
                                <AppButton variant="contained" onClick={() => navigate('/register')}>
                                    Get Started
                                </AppButton>
                            </>
                        ) : (
                            // <AppButton variant="contained" onClick={() => navigate('/dashboard')}>
                            //     Dashboard
                            // </AppButton>
                            null
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
