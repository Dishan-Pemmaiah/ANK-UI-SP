import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

export default function AdminDashboard() {
  const items = [
    { title: 'Manage Members', route: '/admin/members' },
    { title: 'Manage About', route: '/admin/about' },
    { title: 'Manage Committee', route: '/admin/committee' },
    { title: 'Manage Heritage', route: '/admin/heritage' },
    { title: 'Manage Events', route: '/admin/events' },
    { title: 'Manage Sports', route: '/admin/sports' },
    { title: 'Manage News', route: '/admin/news' },
    { title: 'Manage Gallery', route: '/admin/gallery' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Portal</Typography>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} key={item.title}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Button sx={{ mt: 2 }} variant="contained" component={NavLink} to={item.route}>Go</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
