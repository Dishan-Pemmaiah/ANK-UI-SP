import { NavLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';

const items = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Members', path: '/admin/members' },
  { label: 'About', path: '/admin/about' },
  { label: 'Committee', path: '/admin/committee' },
  { label: 'Heritage', path: '/admin/heritage' },
  { label: 'Events', path: '/admin/events' },
  { label: 'Sports Overview', path: '/admin/sports' },
  { label: 'ANJK 3 Hockey', path: '/admin/anjk-3' },
  { label: 'Sports Hosted', path: '/admin/sports/hosted' },
  { label: 'Sports External', path: '/admin/sports/external' },
  { label: 'Sports Live', path: '/admin/sports/live' },
  { label: 'Sports Fixtures', path: '/admin/sports/fixtures' },
  { label: 'Sports History', path: '/admin/sports/history' },
  { label: 'Home Content', path: '/admin/home-content' },
  { label: 'Contact Settings', path: '/admin/contact-settings' },
  { label: 'Updates', path: '/admin/updates' },
  { label: 'Gallery', path: '/admin/gallery' },
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
