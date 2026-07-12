import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, TextField, Button, MenuItem } from '@mui/material';
import sportsApi from '../../services/sportsService';

const emptyCategory = {
  name: '',
  description: ''
};

const emptyTournament = {
  title: '',
  sportName: 'Hockey',
  activityType: 'Played',
  recordState: 'History',
  eventDate: new Date().toISOString().slice(0, 10),
  venue: '',
  opponentOrHost: '',
  description: '',
  result: '',
  sortOrder: 0
};

export default function AdminSports() {
  const [categories, setCategories] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [tournamentForm, setTournamentForm] = useState(emptyTournament);
  const [editingTournamentId, setEditingTournamentId] = useState(null);

  const loadCategories = () => {
    setLoading(true);
    sportsApi.getCategories()
      .then((data) => setCategories(data))
      .catch((error) => console.error('Failed to load sports categories', error))
      .finally(() => setLoading(false));
  };

  const loadTournaments = () => {
    setTournamentLoading(true);
    sportsApi.getTournaments()
      .then((data) => setTournaments(data))
      .catch((error) => console.error('Failed to load sport tournaments', error))
      .finally(() => setTournamentLoading(false));
  };

  useEffect(() => {
    loadCategories();
    loadTournaments();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCategory);
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name || '', description: category.description || '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = editingId ? await sportsApi.updateCategory(editingId, form) : await sportsApi.createCategory(form);
    setCategories((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handleDelete = async (id) => {
    await sportsApi.deleteCategory(id);
    setCategories((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const resetTournamentForm = () => {
    setEditingTournamentId(null);
    setTournamentForm(emptyTournament);
  };

  const startTournamentEdit = (item) => {
    setEditingTournamentId(item.id);
    setTournamentForm({
      title: item.title || '',
      sportName: item.sportName || 'Hockey',
      activityType: item.activityType || 'Played',
      recordState: item.recordState || 'History',
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      venue: item.venue || '',
      opponentOrHost: item.opponentOrHost || '',
      description: item.description || '',
      result: item.result || '',
      sortOrder: item.sortOrder || 0
    });
  };

  const handleTournamentSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...tournamentForm,
      eventDate: new Date(tournamentForm.eventDate).toISOString()
    };

    const saved = editingTournamentId ? await sportsApi.updateTournament(editingTournamentId, payload) : await sportsApi.createTournament(payload);
    setTournaments((prev) => editingTournamentId ? prev.map((item) => (item.id === editingTournamentId ? saved : item)) : [saved, ...prev]);
    resetTournamentForm();
  };

  const handleTournamentDelete = async (id) => {
    await sportsApi.deleteTournament(id);
    setTournaments((prev) => prev.filter((item) => item.id !== id));
    if (editingTournamentId === id) {
      resetTournamentForm();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Sports</Typography>
      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        Use categories for sport labels, and tournament records for the clear Played vs Hosted live/history sections.
      </Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Sport Category' : 'Add Sport Category'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingId ? 'Update Category' : 'Add Category'}</Button>{editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingTournamentId ? 'Edit Tournament Record' : 'Add Tournament Record'}</Typography>
        <Box component="form" onSubmit={handleTournamentSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Title" value={tournamentForm.title} onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Sport Name" select value={tournamentForm.sportName} onChange={(e) => setTournamentForm({ ...tournamentForm, sportName: e.target.value })}>
              <MenuItem value="Hockey">Hockey</MenuItem>
              <MenuItem value="Cricket">Cricket</MenuItem>
              <MenuItem value="Football">Football</MenuItem>
              <MenuItem value="Marathon">Marathon</MenuItem>
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Activity Type" select value={tournamentForm.activityType} onChange={(e) => setTournamentForm({ ...tournamentForm, activityType: e.target.value })}>
              <MenuItem value="Played">Played</MenuItem>
              <MenuItem value="Hosted">Hosted</MenuItem>
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Record State" select value={tournamentForm.recordState} onChange={(e) => setTournamentForm({ ...tournamentForm, recordState: e.target.value })}>
              <MenuItem value="Live">Live</MenuItem>
              <MenuItem value="History">History</MenuItem>
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Event Date" type="date" value={tournamentForm.eventDate} onChange={(e) => setTournamentForm({ ...tournamentForm, eventDate: e.target.value })} InputLabelProps={{ shrink: true }} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Venue" value={tournamentForm.venue} onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Opponent / Host" value={tournamentForm.opponentOrHost} onChange={(e) => setTournamentForm({ ...tournamentForm, opponentOrHost: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Result / Status" value={tournamentForm.result} onChange={(e) => setTournamentForm({ ...tournamentForm, result: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Description" value={tournamentForm.description} onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Sort Order" value={tournamentForm.sortOrder} onChange={(e) => setTournamentForm({ ...tournamentForm, sortOrder: Number(e.target.value) })} /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingTournamentId ? 'Update Tournament' : 'Add Tournament'}</Button>{editingTournamentId && <Button sx={{ ml: 2 }} onClick={resetTournamentForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Typography>Loading sports categories...</Typography>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} md={6} key={category.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography>{category.description}</Typography>
                  <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startEdit(category)}>Edit</Button>
                  <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleDelete(category.id)}>Delete</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Play and Host Records</Typography>
        {tournamentLoading ? (
          <Typography>Loading tournament records...</Typography>
        ) : (
          <Grid container spacing={3}>
            {tournaments.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ background: '#141414' }}>
                  <CardContent>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography>{item.sportName} • {item.activityType} • {item.recordState}</Typography>
                    <Typography>{new Date(item.eventDate).toLocaleDateString()}</Typography>
                    <Typography>{item.venue}</Typography>
                    <Typography>{item.opponentOrHost}</Typography>
                    <Typography>{item.result}</Typography>
                    <Typography sx={{ mt: 1 }}>{item.description}</Typography>
                    <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startTournamentEdit(item)}>Edit</Button>
                    <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleTournamentDelete(item.id)}>Delete</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}