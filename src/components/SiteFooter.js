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
    <Box component="footer" sx={{ mt: 4, px: { xs: 2, md: 4 }, py: 4, borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0c0c0c' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{data.footerTitle}</Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Quick Links</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.25, display: 'grid', gap: 0.35 }}>
            {(data.quickLinks || []).map((item) => (
              <Box key={`${item.label}-${item.path}`} component="li" sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.2 }}>
                <Link
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  underline="hover"
                  sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}
                >
                  {item.label}
                </Link>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Contact Information</Typography>
          <Typography sx={{ opacity: 0.85 }}>{data.email}</Typography>
          {data.phoneNumber ? <Typography sx={{ opacity: 0.85 }}>{data.phoneNumber}</Typography> : null}
          {data.address ? <Typography sx={{ opacity: 0.85 }}>{data.address}</Typography> : null}
        </Grid>

        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Social Media</Typography>
          <Stack spacing={0.8}>
            {socialLinks(data).map((item) => (
              <Link key={item.label} href={item.href} target="_blank" rel="noreferrer" color="inherit" underline="hover">
                {item.label}
              </Link>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
      <Typography sx={{ opacity: 0.7, fontSize: '0.88rem' }}>
        {data.copyrightText}
      </Typography>
    </Box>
  );
}
