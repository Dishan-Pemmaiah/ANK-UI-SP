import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Paper, TextField, Button } from '@mui/material';
import galleryApi from '../../services/galleryService';

const emptyGallery = { title: '', imageUrl: '' };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyGallery);
  const [editingId, setEditingId] = useState(null);

  const loadItems = () => {
    setLoading(true);
    galleryApi.getAll()
      .then((data) => setItems(data))
      .catch((error) => console.error('Failed to load gallery', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyGallery);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title || '', imageUrl: item.imageUrl || '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = editingId ? await galleryApi.update(editingId, form) : await galleryApi.create(form);
    setItems((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handleDelete = async (id) => {
    await galleryApi.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Gallery</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingId ? 'Update Gallery Item' : 'Add Gallery Item'}</Button>{editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>
      {loading ? <Typography>Loading gallery...</Typography> : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ background: '#141414' }}>
                <CardMedia component="img" height="180" image={item.imageUrl} alt={item.title} />
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
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