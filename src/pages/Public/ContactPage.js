import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, Stack } from '@mui/material';
import contactSettingsApi from '../../services/contactSettingsService';

const instagramUrl = 'https://www.instagram.com/anjigeri_naad_club?igsh=NmYxbjc2bnBob3Bj';

export default function ContactPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    contactSettingsApi.get().then(setSettings).catch(() => setSettings(null));
  }, []);

  const data = settings || { email: 'anjigerinaad@gmail.com', phoneNumber: '', address: '', instagramUrl };
  const resolvedInstagramUrl = data.instagramUrl || instagramUrl;

  return (
    <Box>
      <Typography variant="overline" sx={{ letterSpacing: 3, color: '#d9b18f' }}>
        Contact ANK
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
        Let’s stay connected
      </Typography>
      <Typography sx={{ mb: 3, maxWidth: 760, color: 'rgba(255,255,255,0.78)' }}>
        Use the form for general messages, or follow the club on Instagram for photos, updates, and announcements.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: '#141414' }}>
            <CardContent>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>Instagram</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>ANK on Instagram</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1 }}>
                Follow the club for match photos, event coverage, heritage posts, and live updates.
              </Typography>
              <Button component="a" href={resolvedInstagramUrl} target="_blank" rel="noreferrer" variant="contained" sx={{ mt: 2 }}>
                Open Instagram
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: '#141414' }}>
            <CardContent>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>Pages</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>Quick website links</Typography>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                <Button component={Link} to="/about" color="inherit" sx={{ justifyContent: 'flex-start' }}>About ANK</Button>
                <Button component={Link} to="/events" color="inherit" sx={{ justifyContent: 'flex-start' }}>Events</Button>
                <Button component={Link} to="/sports" color="inherit" sx={{ justifyContent: 'flex-start' }}>Sports</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: '#141414' }}>
            <CardContent>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>Contact details</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{data.email}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1 }}>
                 {[data.phoneNumber, data.address].filter(Boolean).join(' | ') || 'Ask about memberships, events, heritage content, committee updates, or general club information.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
}
