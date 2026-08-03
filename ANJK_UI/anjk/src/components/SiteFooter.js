import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import siteContentService, { SITE_CONTENT_KEYS } from '../services/siteContentService';

const defaultTagline = 'Anjigeri Naad Koota: Community, sport, and heritage together.';

export default function SiteFooter() {
  const [tagline, setTagline] = useState(defaultTagline);

  useEffect(() => {
    siteContentService.getAll()
      .then((data) => {
        setTagline(data[SITE_CONTENT_KEYS.footerTagline] || defaultTagline);
      })
      .catch(() => setTagline(defaultTagline));
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 2,
        px: 2,
        borderTop: '1px solid rgba(255,255,255,0.10)',
        backgroundColor: '#0f0f0f',
        textAlign: 'center'
      }}
    >
      <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: { xs: '0.92rem', md: '1rem' } }}>
        {tagline}
      </Typography>
    </Box>
  );
}
