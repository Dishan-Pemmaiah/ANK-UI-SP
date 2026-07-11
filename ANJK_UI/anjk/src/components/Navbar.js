import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import AuthContext from '../context/AuthContext';

const logoSrc = '/ank-logo.jpeg';
const announcements = [
  { text: 'Live match update: ANK vs Kodagu Warriors starts at 6 PM today.', path: '/live' },
  { text: 'Announcement: New club membership registrations are open now.', path: '/register' },
  { text: 'News: KHPL champion celebration event scheduled for this weekend.', path: '/news' }
];

export default function Navbar({ onDrawerToggle }) {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onDrawerToggle}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Box component="img" src={logoSrc} alt="ANK Logo" sx={{ height: 48, width: 48, borderRadius: '50%', border: '2px solid #b30000' }} />
            <Typography variant="h6" component={NavLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}>
              Anjigeri Naad Koota
            </Typography>
          </Box>
        </Box>

        <Box
          component="button"
          onClick={() => navigate(announcements[activeIndex].path)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', md: 'auto' },
            minWidth: 0,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)'
            }
          }}
        >
          <Typography
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: '#b30000',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            Live
          </Typography>
          <Typography noWrap sx={{ fontSize: '0.9rem', color: '#ffffff' }}>
            {announcements[activeIndex].text}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {auth?.isAuthenticated ? (
            <>
              <Button color="inherit" component={NavLink} to="/profile">
                Profile
              </Button>
              <Button color="inherit" onClick={() => { auth.logout(); navigate('/'); }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={NavLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={NavLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
