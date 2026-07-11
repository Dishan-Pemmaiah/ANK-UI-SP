import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Grid } from '@mui/material';
import eventApi from '../../services/eventService';

export default function EventFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    fee: 0,
    isPaid: true,
    isPublished: true
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await eventApi.create({
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString()
    });
    navigate('/events');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Create Event</Typography>
      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Event name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fee" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save Event</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
