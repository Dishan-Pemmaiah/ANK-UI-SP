import { useEffect, useState } from 'react';
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import homeContentApi from '../../services/homeContentService';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read image file.'));
  reader.readAsDataURL(file);
});

export default function AdminHomeContent() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    homeContentApi.get()
      .then((data) => setForm(data))
      .catch((err) => setError(err?.message || 'Failed to load home content.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const saved = await homeContentApi.save(form);
      setForm(saved);
      setSuccess('Home page content updated successfully.');
    } catch (err) {
      setError(err?.message || 'Failed to save home content.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !form) {
      return;
    }

    const encoded = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    setForm((prev) => ({ ...prev, homeImages: [...(prev.homeImages || []), ...encoded] }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, homeImages: (prev.homeImages || []).filter((_, i) => i !== index) }));
  };

  if (loading) {
    return <Typography>Loading home content...</Typography>;
  }

  if (!form) {
    return <Typography>Unable to load home content.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Home Page Content Management</Typography>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Paper sx={{ p: 3, background: '#141414' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Hero Title" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Hero Subtitle" value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Welcome Section" value={form.welcomeSection} onChange={(e) => setForm({ ...form, welcomeSection: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="About Section" value={form.aboutSection} onChange={(e) => setForm({ ...form, aboutSection: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Featured Content" value={form.featuredContent} onChange={(e) => setForm({ ...form, featuredContent: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Announcements" value={form.announcements} onChange={(e) => setForm({ ...form, announcements: e.target.value })} helperText="Use separate lines for multiple announcements." /></Grid>

            <Grid item xs={12}>
              <Button component="label" variant="outlined">
                Upload Home Images
                <input hidden type="file" accept="image/*" multiple onChange={handleImageUpload} />
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={1}>
                {(form.homeImages || []).map((image, index) => (
                  <Grid item key={`home-image-${index}`}>
                    <Box sx={{ position: 'relative' }}>
                      <Box component="img" src={image} alt={`Home ${index + 1}`} sx={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 1 }} />
                      <Button size="small" color="error" onClick={() => removeImage(index)} sx={{ minWidth: 0, px: 1 }}>x</Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save Home Content'}</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
