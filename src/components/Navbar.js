import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import AuthContext from '../context/AuthContext';
import newsApi from '../services/newsService';
import eventApi from '../services/eventService';
import liveApi from '../services/liveService';

const logoSrc = '/ank-logo.jpeg';

export default function Navbar({ onDrawerToggle }) {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      newsApi.getAll().catch(() => []),
      eventApi.getAll().catch(() => []),
      liveApi.getHistory().catch(() => [])
    ]).then(([news, events, liveHistory]) => {
      if (!mounted) {
        return;
      }

      const nextAnnouncements = [
        news[0] ? { text: `News: ${news[0].title}`, path: '/news' } : null,
        events[0] ? { text: `Event: ${events[0].name}`, path: '/events' } : null,
        liveHistory[0] ? { text: `Live: ${liveHistory[0].message}`, path: '/live' } : null
      ].filter(Boolean);

      setAnnouncements(nextAnnouncements);
      setActiveIndex(0);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (announcements.length < 2) {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: { xs: '1 1 100%', md: '1 1 0' } }}>
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
            <Box component={NavLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.05 }}>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                ANK
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.72)', letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Anjigeri Naad Koota
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          component="button"
          onClick={() => navigate(announcements[activeIndex]?.path || '/news')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.25,
            width: { xs: '100%', md: 'min(100%, 560px)' },
            flex: { xs: '1 1 100%', md: '0 1 560px' },
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
            {announcements[activeIndex]?.text || 'Latest updates load from the database.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, flex: { xs: '1 1 100%', md: '1 1 0' } }}>
          {auth?.isAuthenticated ? (
            <>
              <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                {auth.user?.fullName || 'Member'}
              </Typography>
              {auth.isAdmin && (
                <Button color="inherit" component={NavLink} to="/admin">
                  Admin
                </Button>
              )}
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
