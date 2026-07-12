import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, TextField, Button } from '@mui/material';
import heritageApi from '../../services/heritageService';

const emptyHeritage = { title: '', description: '' };

export default function AdminHeritage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyHeritage);
  const [editingId, setEditingId] = useState(null);

  const loadItems = () => {
    setLoading(true);
    heritageApi.getAll()
      .then((data) => setItems(data))
      .catch((error) => console.error('Failed to load heritage', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyHeritage);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title || '', description: item.description || '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = editingId ? await heritageApi.update(editingId, form) : await heritageApi.create(form);
    setItems((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handleDelete = async (id) => {
    await heritageApi.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Heritage</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Heritage Section' : 'Add Heritage Section'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingId ? 'Update Heritage Section' : 'Add Heritage Section'}</Button>{editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? <Typography>Loading heritage...</Typography> : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>{item.description}</Typography>
                  <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startEdit(item)}>Edit</Button>
                  <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleDelete(item.id)}>Delete</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}