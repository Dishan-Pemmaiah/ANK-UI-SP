import { useEffect, useState } from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Box, Typography, Button, Paper, Grid, Card, CardContent, Chip, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import newsApi from '../../services/newsService';
import eventApi from '../../services/eventService';
import achievementApi from '../../services/achievementService';

const logoSrc = '/ank-logo.jpeg';
const instagramUrl = 'https://www.instagram.com/anjigeri_naad_club?igsh=NmYxbjc2bnBob3Bj';

export default function HomePage() {
  const [highlights, setHighlights] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);

  useEffect(() => {
    let mounted = true;

    const highlightEntries = new Map();

    const syncHighlights = () => {
      if (!mounted) return;

      const orderedHighlights = ['news', 'events', 'achievements']
        .map((key) => highlightEntries.get(key))
        .filter(Boolean);

      setHighlights(orderedHighlights);
      setActiveIndex((previousIndex) => {
        if (orderedHighlights.length === 0) {
          return 0;
        }

        return Math.min(previousIndex, orderedHighlights.length - 1);
      });
    };

    const loadSection = async (key, request, mapItem) => {
      try {
        const items = await request();
        const firstItem = Array.isArray(items) ? items[0] : null;
        if (firstItem) {
          highlightEntries.set(key, mapItem(firstItem));
          syncHighlights();
        }
      } catch {
        // Keep the homepage responsive even when one section is slow or unavailable.
      } finally {
        pendingLoads -= 1;
        if (pendingLoads === 0 && mounted) {
          setIsLoadingHighlights(false);
        }
      }
    };

    let pendingLoads = 3;

    loadSection('news', () => newsApi.getAll(), (item) => ({
      title: item.title,
      description: item.content,
      action: { label: 'Read news', path: '/news' }
    }));

    loadSection('events', () => eventApi.getAll(), (item) => ({
      title: item.name,
      description: item.description,
      action: { label: 'View events', path: '/events' }
    }));

    loadSection('achievements', () => achievementApi.getAll(), (item) => ({
      title: item.title,
      description: item.description,
      action: { label: 'View achievements', path: '/achievements' }
    }));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (highlights.length < 2) return undefined;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % highlights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [highlights.length]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 3, md: 6 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #101010 0%, #0c1614 45%, #160f12 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 'auto -80px -120px auto', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(179,0,0,0.35) 0%, rgba(179,0,0,0.0) 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', inset: 'auto auto -120px -120px', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,140,106,0.2) 0%, rgba(0,140,106,0) 72%)', pointerEvents: 'none' }} />

        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.25, flexWrap: 'wrap' }}>
              <Box
                component="img"
                src={logoSrc}
                alt="ANK Logo"
                sx={{
                  width: { xs: 68, sm: 78, md: 92 },
                  height: { xs: 68, sm: 78, md: 92 },
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.22)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.35), 0 0 0 8px rgba(255,255,255,0.04)'
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Chip
                  label="Anjigeri Naad Koota"
                  sx={{
                    mb: 1,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                />
                <Typography variant="overline" sx={{ display: 'block', color: '#e0b08f', letterSpacing: 4, fontWeight: 800 }}>
                  Community. Sport. Heritage.
                </Typography>
              </Box>
            </Stack>
            <Typography component="h1" sx={{ fontSize: { xs: '2.8rem', md: '4.8rem' }, lineHeight: 0.95, fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', maxWidth: 900 }}>
              Anjigeri Naad Koota
            </Typography>
            <Typography sx={{ mt: 2.5, fontSize: { xs: '1rem', md: '1.18rem' }, maxWidth: 720, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8 }}>
              A bold home for Kodava heritage, competitive sport, village unity, live updates, and club history - built from the database, not static copy.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
              <Button component={Link} to="/about" variant="contained" size="large" sx={{ px: 3.5, py: 1.5 }}>
                Explore ANK
              </Button>
              <Button component={Link} to="/sports" variant="outlined" size="large" sx={{ px: 3.5, py: 1.5, borderColor: 'rgba(255,255,255,0.24)', color: '#fff' }}>
                View sports history
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d6d6d6' }}>
                What ANK stands for
              </Typography>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
              <Stack spacing={2.2}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Live club updates</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.78)' }}>Current news, events, and live sports broadcast from the database.</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Played and hosted records</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.78)' }}>Separate histories for matches played and tournaments hosted.</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Heritage and committee</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.78)' }}>Structured content for the people, culture, and leadership of ANK.</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(179,0,0,0.14))',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 3, color: '#e0b08f' }}>
              Connect with ANK
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Contact and Instagram in one place
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 760, mt: 1 }}>
              Keep the homepage clean while still giving visitors an easy way to reach the club or follow updates.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} to="/contact" variant="contained" size="large">
              Contact ANK
            </Button>
            <Button
              component="a"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<InstagramIcon />}
            >
              Instagram
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', background: '#141414' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Need to reach the club?</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1.25 }}>
                  Use the contact page for general questions, membership, events, committee, or heritage details.
                </Typography>
                <Button component={Link} to="/contact" variant="contained" sx={{ mt: 2 }}>
                  Open contact page
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', background: '#141414' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Follow club moments</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1.25 }}>
                  See photos, updates, event coverage, and match highlights on Instagram.
                </Typography>
                <Button component="a" href={instagramUrl} target="_blank" rel="noreferrer" variant="outlined" color="inherit" sx={{ mt: 2 }} startIcon={<InstagramIcon />}>
                  Open Instagram
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Sports tracked', value: '4+', note: 'Hockey, cricket, football, marathon' },
          { label: 'Content sections', value: '8+', note: 'About, committee, heritage, news and more' },
          { label: 'Live + history', value: '2', note: 'Played and hosted states are separated' }
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.label}>
            <Card sx={{ background: '#131313', height: '100%' }}>
              <CardContent>
                <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>{item.label}</Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 900 }}>{item.value}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>{item.note}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 2.5, md: 4 }, mb: 4, background: '#111111', color: '#fff', borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 3, color: '#e0b08f' }}>
              Latest from the club
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Featured ANK Updates
            </Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 360 }}>
            News, events, and achievements rotate here so the homepage feels alive the moment it loads.
          </Typography>
        </Stack>

        {highlights[activeIndex] ? (
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={8}>
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, background: 'linear-gradient(135deg, rgba(179,0,0,0.18), rgba(0,140,106,0.10))', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Chip label="Spotlight" sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}>
                  {highlights[activeIndex].title}
                </Typography>
                <Typography paragraph sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.02rem', lineHeight: 1.8 }}>
                  {highlights[activeIndex].description}
                </Typography>
                <Button component={Link} to={highlights[activeIndex].action.path} variant="contained" sx={{ px: 3, py: 1.25 }}>
                  {highlights[activeIndex].action.label}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'grid', gap: 1.5, height: '100%' }}>
                {highlights.map((highlight, index) => (
                  <Paper
                    key={highlight.title}
                    onClick={() => setActiveIndex(index)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 3,
                      background: index === activeIndex ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'transform 180ms ease, background 180ms ease',
                      '&:hover': { transform: 'translateY(-2px)', background: 'rgba(255,255,255,0.08)' }
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{highlight.title}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.92rem' }} noWrap>
                      {highlight.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : isLoadingHighlights ? (
          <Typography paragraph sx={{ color: 'rgba(255,255,255,0.78)' }}>
            Loading latest updates...
          </Typography>
        ) : (
          <Typography paragraph sx={{ color: 'rgba(255,255,255,0.78)' }}>No database updates are available yet.</Typography>
        )}
      </Paper>
    </Box>
  );
}
