import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Paper, Card, CardContent, Stack } from '@mui/material';
import siteContentService, { SITE_CONTENT_KEYS } from '../../services/siteContentService';

const defaultInstagramUrl = 'https://www.instagram.com/anjigeri_naad_club?igsh=NmYxbjc2bnBob3Bj';

export default function ContactPage() {
  const [cms, setCms] = useState({
    intro: 'Use the form for general messages, or follow the club on Instagram for photos, updates, and announcements.',
    email: '',
    phone: '',
    address: '',
    instagramUrl: defaultInstagramUrl
  });

  useEffect(() => {
    siteContentService.getAll()
      .then((data) => {
        setCms({
          intro: data[SITE_CONTENT_KEYS.contactIntro] || 'Use the form for general messages, or follow the club on Instagram for photos, updates, and announcements.',
          email: data[SITE_CONTENT_KEYS.contactEmail] || '',
          phone: data[SITE_CONTENT_KEYS.contactPhone] || '',
          address: data[SITE_CONTENT_KEYS.contactAddress] || '',
          instagramUrl: data[SITE_CONTENT_KEYS.contactInstagramUrl] || defaultInstagramUrl
        });
      })
      .catch(() => {
        setCms((prev) => ({ ...prev, instagramUrl: defaultInstagramUrl }));
      });
  }, []);

  return (
    <Box>
      <Typography variant="overline" sx={{ letterSpacing: 3, color: '#d9b18f' }}>
        Contact ANK
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
        Let’s stay connected
      </Typography>
      <Typography sx={{ mb: 3, maxWidth: 760, color: 'rgba(255,255,255,0.78)' }}>
        {cms.intro}
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
              <Button component="a" href={cms.instagramUrl || defaultInstagramUrl} target="_blank" rel="noreferrer" variant="contained" sx={{ mt: 2 }}>
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
              <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>Best for</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>Club enquiries</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1 }}>
                Ask about memberships, events, heritage content, committee updates, or general club information.
              </Typography>
              {cms.email ? <Typography sx={{ mt: 1.25, color: 'rgba(255,255,255,0.82)' }}>Email: {cms.email}</Typography> : null}
              {cms.phone ? <Typography sx={{ color: 'rgba(255,255,255,0.82)' }}>Phone: {cms.phone}</Typography> : null}
              {cms.address ? <Typography sx={{ color: 'rgba(255,255,255,0.82)' }}>Address: {cms.address}</Typography> : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2.5, md: 4 }, mt: 2, background: '#141414' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
          Send a message
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Name" variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Message" multiline rows={4} variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained">Send message</Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
