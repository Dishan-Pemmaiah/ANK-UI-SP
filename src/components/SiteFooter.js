import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import contactSettingsApi from '../services/contactSettingsService';

const socialLinks = (settings) => ([
  { label: 'Facebook', href: settings.facebookUrl },
  { label: 'Instagram', href: settings.instagramUrl },
  { label: 'YouTube', href: settings.youtubeUrl },
  { label: 'WhatsApp', href: settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : '' }
]).filter((item) => item.href);

const compactQuickLinks = (links = []) => {
  if (!Array.isArray(links) || !links.length) {
    return [];
  }

  return links.slice(0, 4);
};

export default function SiteFooter() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    contactSettingsApi.get().then(setSettings).catch(() => setSettings(null));
  }, []);

  const data = settings || {
    footerTitle: 'Anjigeri Naada',
    email: 'anjigerinaad@gmail.com',
    phoneNumber: '',
    address: '',
    quickLinks: [
      { label: 'Home', path: '/' },
      { label: 'Villages', path: '/villages' },
      { label: 'Events', path: '/events' },
      { label: 'Sports', path: '/sports' },
      { label: 'Gallery', path: '/gallery' },
      { label: 'Contact', path: '/contact' }
    ],
    copyrightText: 'Copyright © Anjigeri Naad Koota'
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, #101010 0%, #090909 100%)'
      }}
    >
      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '0.02em' }}>{data.footerTitle}</Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Explore</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {compactQuickLinks(data.quickLinks).map((item) => (
              <Link
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.82, fontSize: '0.92rem', '&:hover': { opacity: 1 } }}
              >
                {item.label}
              </Link>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Contact</Typography>
          <Typography sx={{ opacity: 0.85 }}>{data.email}</Typography>
          {data.phoneNumber ? <Typography sx={{ opacity: 0.85 }}>{data.phoneNumber}</Typography> : null}
          {socialLinks(data).length ? (
            <Stack direction="row" spacing={1.2} sx={{ mt: 1 }}>
              {socialLinks(data).slice(0, 2).map((item) => (
                <Link key={item.label} href={item.href} target="_blank" rel="noreferrer" color="inherit" underline="hover" sx={{ opacity: 0.86, fontSize: '0.9rem' }}>
                  {item.label}
                </Link>
              ))}
            </Stack>
          ) : null}
        </Grid>
      </Grid>

      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
      <Typography sx={{ opacity: 0.68, fontSize: '0.86rem' }}>
        {data.copyrightText}
      </Typography>
    </Box>
  );
}
