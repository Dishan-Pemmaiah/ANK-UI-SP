import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Paper, TextField, FormControlLabel, Checkbox } from '@mui/material';
import eventApi from '../../services/eventService';

const emptyEvent = {
  name: '',
  description: '',
  category: '',
  location: '',
  startDate: '',
  endDate: '',
  fee: 0,
  isPaid: true,
  isPublished: true
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);

  const loadEvents = () => {
    setLoading(true);
    eventApi.getAll()
      .then((data) => setEvents(data))
      .catch((error) => console.error('Failed to load events', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyEvent);
  };

  const startEdit = (eventItem) => {
    setEditingId(eventItem.id);
    setForm({
      name: eventItem.name || '',
      description: eventItem.description || '',
      category: eventItem.category || '',
      location: eventItem.location || '',
      startDate: eventItem.startDate ? new Date(eventItem.startDate).toISOString().slice(0, 10) : '',
      endDate: eventItem.endDate ? new Date(eventItem.endDate).toISOString().slice(0, 10) : '',
      fee: eventItem.fee || 0,
      isPaid: Boolean(eventItem.isPaid),
      isPublished: Boolean(eventItem.isPublished)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString()
    };

    const saved = editingId ? await eventApi.update(editingId, payload) : await eventApi.create(payload);
    setEvents((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handleDelete = async (id) => {
    await eventApi.delete(id);
    setEvents((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Events</Typography>

      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Event' : 'Add Event'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Event name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} InputLabelProps={{ shrink: true }} required /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} InputLabelProps={{ shrink: true }} required /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Fee" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} required /></Grid>
            <Grid item xs={12} sm={4}><FormControlLabel control={<Checkbox checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} />} label="Paid event" /></Grid>
            <Grid item xs={12} sm={4}><FormControlLabel control={<Checkbox checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />} label="Published" /></Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">{editingId ? 'Update Event' : 'Add Event'}</Button>
              {editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Typography>Loading events...</Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((eventItem) => (
            <Grid item xs={12} md={6} key={eventItem.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{eventItem.name}</Typography>
                  <Typography>{eventItem.category}</Typography>
                  <Typography>{eventItem.location}</Typography>
                  <Typography>
                    {new Date(eventItem.startDate).toLocaleDateString()} - {new Date(eventItem.endDate).toLocaleDateString()}
                  </Typography>
                  <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startEdit(eventItem)}>Edit</Button>
                  <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleDelete(eventItem.id)}>Delete</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
