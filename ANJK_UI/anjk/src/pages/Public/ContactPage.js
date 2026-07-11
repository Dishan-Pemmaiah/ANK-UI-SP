import { Box, Typography, TextField, Button, Grid, Paper } from '@mui/material';

export default function ContactPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>
      <Paper sx={{ p: 4, mt: 2 }}>
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
