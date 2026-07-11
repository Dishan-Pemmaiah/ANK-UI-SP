import { Box, Typography, Grid, Paper, Button } from '@mui/material';

export default function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Portal</Typography>
      <Grid container spacing={3}>
        {[
          { title: 'Manage Members', route: '/admin/members' },
          { title: 'Manage Events', route: '/admin/events' },
          { title: 'Manage Sports', route: '/admin/sports' },
          { title: 'Manage News', route: '/admin/news' },
          { title: 'Manage Gallery', route: '/admin/gallery' }
        ].map((item) => (
          <Grid item xs={12} sm={6} key={item.title}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Button sx={{ mt: 2 }} variant="contained">Go</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
