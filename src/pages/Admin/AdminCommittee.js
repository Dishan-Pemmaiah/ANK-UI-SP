import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, TextField, Button, Stack } from '@mui/material';
import committeeApi from '../../services/committeeService';

const emptyCommittee = { name: '', role: '', description: '', photoUrl: '' };

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.readAsDataURL(file);
});

export default function AdminCommittee() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCommittee);
  const [editingId, setEditingId] = useState(null);

  const loadItems = () => {
    setLoading(true);
    committeeApi.getAll()
      .then((data) => setItems(data))
      .catch((error) => console.error('Failed to load committee', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCommittee);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name || '', role: item.role || '', description: item.description || '', photoUrl: item.photoUrl || '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = editingId ? await committeeApi.update(editingId, form) : await committeeApi.create(form);
    setItems((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
    resetForm();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, photoUrl: dataUrl }));
  };

  const clearPhoto = () => {
    setForm((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleDelete = async (id) => {
    await committeeApi.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Committee</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Committee Member' : 'Add Committee Member'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Photo upload optional</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Button component="label" variant="outlined">
                    Upload photo
                    <input hidden type="file" accept="image/*" onChange={handlePhotoUpload} />
                  </Button>
                  <Button variant="text" onClick={clearPhoto} disabled={!form.photoUrl}>
                    Remove photo
                  </Button>
                  {form.photoUrl ? (
                    <Typography sx={{ fontSize: '0.9rem', opacity: 0.8 }}>Photo selected</Typography>
                  ) : (
                    <Typography sx={{ fontSize: '0.9rem', opacity: 0.7 }}>If no photo is uploaded, the committee page will show the ANK default image.</Typography>
                  )}
                </Stack>
                {form.photoUrl ? (
                  <Box
                    component="img"
                    src={form.photoUrl}
                    alt="Committee preview"
                    sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                ) : null}
              </Stack>
            </Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">{editingId ? 'Update Committee Member' : 'Add Committee Member'}</Button>{editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}</Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? <Typography>Loading committee...</Typography> : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  {item.photoUrl ? (
                    <Box
                      component="img"
                      src={item.photoUrl}
                      alt={item.name}
                      sx={{ width: '100%', height: 220, borderRadius: 2, objectFit: 'cover', mb: 2, border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src="/ank-logo.jpeg"
                      alt="ANK default committee"
                      sx={{ width: '100%', height: 220, borderRadius: 2, objectFit: 'cover', mb: 2, border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  )}
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography>{item.role}</Typography>
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