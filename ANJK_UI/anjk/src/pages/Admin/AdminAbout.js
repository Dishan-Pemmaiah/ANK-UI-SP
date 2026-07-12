import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, TextField, Button, FormControlLabel, Checkbox } from '@mui/material';
import aboutApi from '../../services/aboutService';

const emptySection = {
  title: '',
  body: '',
  sortOrder: 0,
  isActive: true
};

export default function AdminAbout() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptySection);
  const [editingId, setEditingId] = useState(null);

  const loadSections = () => {
    setLoading(true);
    aboutApi.getAll()
      .then((data) => setSections(data))
      .catch((error) => console.error('Failed to load about sections', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSections();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptySection);
  };

  const startEdit = (section) => {
    setEditingId(section.id);
    setForm({
      title: section.title || '',
      body: section.body || '',
      sortOrder: section.sortOrder || 0,
      isActive: Boolean(section.isActive)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = editingId ? await aboutApi.update(editingId, form) : await aboutApi.create(form);
    setSections((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handleDelete = async (id) => {
    await aboutApi.delete(id);
    setSections((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage About Content</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit About Section' : 'Add About Section'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={5} label="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></Grid>
            <Grid item xs={12}><FormControlLabel control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingId ? 'Update Section' : 'Add Section'}</Button>{editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Typography>Loading about sections...</Typography>
      ) : (
        <Grid container spacing={3}>
          {sections.map((section) => (
            <Grid item xs={12} md={6} key={section.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{section.title}</Typography>
                  <Typography>{section.body}</Typography>
                  <Typography sx={{ mt: 1, opacity: 0.8 }}>Sort order: {section.sortOrder}</Typography>
                  <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startEdit(section)}>Edit</Button>
                  <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleDelete(section.id)}>Delete</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}