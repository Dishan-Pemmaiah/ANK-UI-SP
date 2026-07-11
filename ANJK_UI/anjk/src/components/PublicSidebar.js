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

export default function PublicSidebar() {
  const [heritableOpen, setHeritableOpen] = useState(false);

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: '#111111',
        minHeight: 'calc(100vh - 64px)',
        p: 2,
        display: { xs: 'none', md: 'block' }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
        Explore ANK
      </Typography>
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
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
      </List>
    </Box>
  );
}
