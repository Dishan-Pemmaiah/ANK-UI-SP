import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import AuthContext from '../context/AuthContext';
import newsApi from '../services/newsService';
import eventApi from '../services/eventService';
import liveApi from '../services/liveService';
import sportsApi from '../services/sportsService';

const logoSrc = '/ank-logo.jpeg';

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const parseTypedCategory = (message, fallback) => {
  const text = String(message || '').trim();
  const match = text.match(/^([a-zA-Z ]{3,20})\s*[:|-]\s*/);

  if (!match) {
    return { category: fallback, text };
  }

  const typedCategory = titleCase(match[1].trim());
  const cleaned = text.slice(match[0].length).trim();

  return {
    category: typedCategory || fallback,
    text: cleaned || text
  };
};

const stripUrls = (value) => String(value || '')
  .replace(/https?:\/\/[^\s]+/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const buildAnnouncement = (rawText, fallbackType, path, fallbackText) => {
  const parsed = parseTypedCategory(stripUrls(rawText), fallbackType);

  return {
    type: parsed.category || fallbackType,
    text: parsed.text || fallbackText,
    path
  };
};

const toTime = (value) => {
  const parsed = new Date(value || '').getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Navbar({ onDrawerToggle }) {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadAnnouncements = () => {
      Promise.all([
        newsApi.getAll().catch(() => []),
        eventApi.getAll().catch(() => []),
        liveApi.getCurrent().catch(() => null),
        sportsApi.getTournaments().catch(() => [])
      ]).then(([news, events, liveCurrent, sports]) => {
        if (!mounted) {
          return;
        }

        const sortedNews = [...(news || [])].sort((a, b) => {
          const timeA = toTime(a.publishedOn || a.createdOn || a.createdAt);
          const timeB = toTime(b.publishedOn || b.createdOn || b.createdAt);

          if (timeA !== timeB) {
            return timeB - timeA;
          }

          return Number(b.id || 0) - Number(a.id || 0);
        });

        const latestEvent = events[0] || null;
        const latestSportsLive = (sports || []).find((item) => {
          const status = String(item?.status || '').toLowerCase();
          const type = String(item?.tournamentType || '').toLowerCase();
          return status === 'live' || type === 'live';
        });

        const newsAnnouncements = sortedNews
          .filter(Boolean)
          .slice(0, 20)
          .map((item) => buildAnnouncement(
            item.title || item.heading || item.content,
            item.category || item.type || 'News',
            '/updates',
            'Latest news update'
          ));

        const nextAnnouncements = [
          ...newsAnnouncements,
          latestEvent
            ? buildAnnouncement(
              latestEvent.name || latestEvent.title || latestEvent.description,
              latestEvent.category || latestEvent.type || 'Event',
              '/events',
              'Latest event update'
            )
            : null,
          latestSportsLive
            ? buildAnnouncement(
              latestSportsLive.currentTournament || latestSportsLive.matchSchedule || latestSportsLive.tournamentName || latestSportsLive.description,
              latestSportsLive.category || latestSportsLive.type || 'Sports Live',
              '/sports',
              'Live sports update'
            )
            : null,
          liveCurrent
            ? buildAnnouncement(
              liveCurrent.message || liveCurrent.description || liveCurrent.title,
              liveCurrent.category || liveCurrent.type || 'Live',
              '/updates',
              'Latest live update'
            )
            : null
        ].filter(Boolean);

        setAnnouncements(nextAnnouncements);
        setActiveIndex((previous) => {
          if (!nextAnnouncements.length) {
            return 0;
          }
          return Math.min(previous, nextAnnouncements.length - 1);
        });
      });
    };

    loadAnnouncements();
    const refreshInterval = setInterval(loadAnnouncements, 15000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
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
          onClick={() => navigate(announcements[activeIndex]?.path || '/updates')}
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
            {announcements[activeIndex]?.type || 'Update'}
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
