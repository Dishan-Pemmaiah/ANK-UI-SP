import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const items = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Committee', path: '/committee' },
  { label: 'News', path: '/news' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Events', path: '/events' },
  { label: 'Live', path: '/live' },
  { label: 'Achievements', path: '/achievements' }
];

const heritableItems = [
  { label: 'Heritage', path: '/heritage' },
  { label: 'Hall of Fame', path: '/hall-of-fame' },
  { label: 'Villages', path: '/villages' },
  { label: 'Okka', path: '/okka' }
];

const instagramUrl = 'https://www.instagram.com/anjigeri_naad_club?igsh=NmYxbjc2bnBob3Bj';

export default function PublicSidebar({ mobile = false, onNavigate }) {
  const [heritableOpen, setHeritableOpen] = useState(false);

  return (
    <Box
      sx={{
        width: mobile ? '100%' : 240,
        bgcolor: '#111111',
        minHeight: mobile ? '100%' : 'calc(100vh - 64px)',
        p: 2,
        display: 'block'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
        Discover ANK
      </Typography>
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              color: '#ffffff',
              mb: 1,
              borderRadius: 1,
              '&.active': {
                bgcolor: '#660000'
              }
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <Box sx={{ borderRadius: 1, mb: 1 }}>
          <ListItemButton
            onClick={() => setHeritableOpen((prev) => !prev)}
            sx={{
              color: '#ffffff',
              borderRadius: 1,
              '&.active': {
                bgcolor: '#660000'
              }
            }}
          >
            <ListItemText primary="Heritable" />
            {heritableOpen ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />}
          </ListItemButton>
          {heritableOpen && (
            <List component="div" disablePadding sx={{ pl: 2 }}>
              {heritableItems.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  onClick={onNavigate}
                  sx={{
                    color: '#ffffff',
                    mb: 1,
                    borderRadius: 1,
                    pl: 3,
                    '&.active': {
                      bgcolor: '#660000'
                    }
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
        <ListItemButton
          component={NavLink}
          to="/contact"
          onClick={onNavigate}
          sx={{
            color: '#ffffff',
            mb: 1,
            borderRadius: 1,
            '&.active': {
              bgcolor: '#660000'
            }
          }}
        >
          <ListItemText primary="Contact" />
        </ListItemButton>
        <ListItemButton
          component="a"
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          sx={{
            color: '#ffffff',
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.04)'
          }}
        >
          <ListItemText primary="Instagram" secondary="See photos, updates, and club moments" secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
        </ListItemButton>
      </List>
    </Box>
  );
}
