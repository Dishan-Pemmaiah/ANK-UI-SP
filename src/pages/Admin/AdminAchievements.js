import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, TextField, Button } from '@mui/material';
import achievementApi from '../../services/achievementService';

const emptyAchievement = {
  title: '',
  description: '',
  awardedOn: new Date().toISOString().slice(0, 10)
};

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyAchievement);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    achievementApi.getAll()
      .then((data) => setAchievements(data))
      .catch((error) => console.error('Failed to load achievements', error))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyAchievement);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      awardedOn: item.awardedOn ? new Date(item.awardedOn).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, awardedOn: new Date(form.awardedOn).toISOString() };
    const saved = editingId ? await achievementApi.update(editingId, payload) : await achievementApi.create(payload);
    setAchievements((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handleDelete = async (id) => {
    await achievementApi.delete(id);
    setAchievements((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Achievements</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Achievement' : 'Add Achievement'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Awarded on" type="date" value={form.awardedOn} onChange={(e) => setForm({ ...form, awardedOn: e.target.value })} InputLabelProps={{ shrink: true }} required /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingId ? 'Update Achievement' : 'Add Achievement'}</Button>{editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>
      {loading ? (
        <Typography>Loading achievements...</Typography>
      ) : (
        <Grid container spacing={3}>
          {achievements.map((achievement) => (
            <Grid item xs={12} md={6} key={achievement.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{achievement.title}</Typography>
                  <Typography>{achievement.description}</Typography>
                  <Typography sx={{ mt: 1, opacity: 0.8 }}>{achievement.awardedOn ? new Date(achievement.awardedOn).toLocaleDateString() : ''}</Typography>
                  <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startEdit(achievement)}>Edit</Button>
                  <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleDelete(achievement.id)}>Delete</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
