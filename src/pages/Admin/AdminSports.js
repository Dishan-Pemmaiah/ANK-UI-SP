import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, TextField, Button, MenuItem, Alert, Stack } from '@mui/material';
import sportsApi from '../../services/sportsService';

const emptyTournament = {
  tournamentName: '',
  tournamentType: 'Hosted',
  hostedBy: '',
  year: new Date().getFullYear(),
  venue: '',
  description: '',
  result: '',
  images: [],
  currentTournament: '',
  matchSchedule: '',
  teamDetails: '',
  status: 'Upcoming',
  sortOrder: 0
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read image file.'));
  reader.readAsDataURL(file);
});

export default function AdminSports() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [tournamentForm, setTournamentForm] = useState(emptyTournament);
  const [editingTournamentId, setEditingTournamentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTournaments = () => {
    setTournamentLoading(true);
    sportsApi.getTournaments()
      .then((data) => setTournaments(data))
      .catch((error) => console.error('Failed to load sport tournaments', error))
      .finally(() => setTournamentLoading(false));
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const resetTournamentForm = () => {
    setEditingTournamentId(null);
    setTournamentForm(emptyTournament);
  };

  const startTournamentEdit = (item) => {
    setEditingTournamentId(item.id);
    setTournamentForm({
      tournamentName: item.tournamentName || '',
      tournamentType: item.tournamentType || 'Hosted',
      hostedBy: item.hostedBy || '',
      year: item.year || new Date().getFullYear(),
      venue: item.venue || '',
      description: item.description || '',
      result: item.result || '',
      images: Array.isArray(item.images) ? item.images : [],
      currentTournament: item.currentTournament || '',
      matchSchedule: item.matchSchedule || '',
      teamDetails: item.teamDetails || '',
      status: item.status || 'Upcoming',
      sortOrder: item.sortOrder || 0
    });
  };

  const handleTournamentSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...tournamentForm,
        year: Number(tournamentForm.year) || new Date().getFullYear(),
        images: Array.isArray(tournamentForm.images) ? tournamentForm.images : []
      };

      const saved = editingTournamentId ? await sportsApi.updateTournament(editingTournamentId, payload) : await sportsApi.createTournament(payload);
      setTournaments((prev) => editingTournamentId ? prev.map((item) => (item.id === editingTournamentId ? saved : item)) : [saved, ...prev]);
      setSuccessMessage(editingTournamentId ? 'Tournament updated.' : 'Tournament created.');
      resetTournamentForm();
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save tournament.');
    }
  };

  const handleTournamentDelete = async (id) => {
    await sportsApi.deleteTournament(id);
    setTournaments((prev) => prev.filter((item) => item.id !== id));
    if (editingTournamentId === id) {
      resetTournamentForm();
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const encoded = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    setTournamentForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...encoded]
    }));
  };

  const removeImage = (index) => {
    setTournamentForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, currentIndex) => currentIndex !== index)
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Sports Tournaments</Typography>
      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        Manage hosted tournaments, external participations, live tournaments, and year-wise history in one place.
      </Typography>
      {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}
      {successMessage ? <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert> : null}

      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingTournamentId ? 'Edit Tournament Record' : 'Add Tournament Record'}</Typography>
        <Box component="form" onSubmit={handleTournamentSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Tournament Name" value={tournamentForm.tournamentName} onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentName: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Tournament Type" select value={tournamentForm.tournamentType} onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentType: e.target.value })}>
              <MenuItem value="Hosted">Hosted Tournaments</MenuItem>
              <MenuItem value="External">External Tournaments Participated</MenuItem>
              <MenuItem value="Live">Live Tournaments</MenuItem>
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Year" type="number" value={tournamentForm.year} onChange={(e) => setTournamentForm({ ...tournamentForm, year: Number(e.target.value) })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Status" select value={tournamentForm.status} onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}>
              <MenuItem value="Upcoming">Upcoming</MenuItem>
              <MenuItem value="Live">Live</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Hosted By" value={tournamentForm.hostedBy} onChange={(e) => setTournamentForm({ ...tournamentForm, hostedBy: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Venue" value={tournamentForm.venue} onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Result / Status" value={tournamentForm.result} onChange={(e) => setTournamentForm({ ...tournamentForm, result: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" value={tournamentForm.description} onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth multiline rows={2} label="Current Tournament" value={tournamentForm.currentTournament} onChange={(e) => setTournamentForm({ ...tournamentForm, currentTournament: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth multiline rows={2} label="Match Schedule" value={tournamentForm.matchSchedule} onChange={(e) => setTournamentForm({ ...tournamentForm, matchSchedule: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Team Details" value={tournamentForm.teamDetails} onChange={(e) => setTournamentForm({ ...tournamentForm, teamDetails: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Sort Order" value={tournamentForm.sortOrder} onChange={(e) => setTournamentForm({ ...tournamentForm, sortOrder: Number(e.target.value) })} /></Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Button component="label" variant="outlined">
                  Upload images
                  <input hidden type="file" accept="image/*" multiple onChange={handleImageUpload} />
                </Button>
                <Typography sx={{ opacity: 0.75 }}>{(tournamentForm.images || []).length} image(s) selected</Typography>
              </Stack>
              {(tournamentForm.images || []).length > 0 ? (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {tournamentForm.images.map((image, index) => (
                    <Grid item key={`preview-${index}`}>
                      <Box sx={{ position: 'relative' }}>
                        <Box component="img" src={image} alt={`preview ${index + 1}`} sx={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 1 }} />
                        <Button size="small" color="error" onClick={() => removeImage(index)} sx={{ minWidth: 0, px: 1 }}>x</Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : null}
            </Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingTournamentId ? 'Update Tournament' : 'Add Tournament'}</Button>{editingTournamentId && <Button sx={{ ml: 2 }} onClick={resetTournamentForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" gutterBottom>Tournament Records</Typography>
        {tournamentLoading ? (
          <Typography>Loading tournament records...</Typography>
        ) : (
          <Grid container spacing={3}>
            {tournaments.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ background: '#141414' }}>
                  <CardContent>
                    <Typography variant="h6">{item.tournamentName}</Typography>
                    <Typography>{item.tournamentType} • {item.status} • {item.year}</Typography>
                    <Typography>{item.venue}</Typography>
                    <Typography>{item.hostedBy}</Typography>
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