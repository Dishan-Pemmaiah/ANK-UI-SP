import { NavLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';

const items = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Members', path: '/admin/members' },
  { label: 'About', path: '/admin/about' },
  { label: 'Committee', path: '/admin/committee' },
  { label: 'Heritage', path: '/admin/heritage' },
  { label: 'Events', path: '/admin/events' },
  { label: 'Sports', path: '/admin/sports' },
  { label: 'News', path: '/admin/news' },
  { label: 'Gallery', path: '/admin/gallery' },
  { label: 'Live Updates', path: '/admin/live' },
  { label: 'Achievements', path: '/admin/achievements' }
];

export default function AdminSidebar() {
  return (
    <Box sx={{ width: 240, bgcolor: '#111111', minHeight: '100vh', p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
        Admin Control
      </Typography>
      <List>
        {items.map((item) => (
          <ListItemButton
            component={NavLink}
            to={item.path}
            key={item.path}
            sx={{
              color: '#ffffff',
              mb: 1,
              '&.active': {
                bgcolor: '#660000'
              }
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
