import { useEffect, useState } from 'react';
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import contactSettingsApi from '../../services/contactSettingsService';

export default function AdminContactSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    contactSettingsApi.get()
      .then((data) => setForm(data))
      .catch((err) => setError(err?.message || 'Failed to load contact settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const saved = await contactSettingsApi.save(form);
      setForm(saved);
      setSuccess('Contact and footer settings updated successfully.');
    } catch (err) {
      setError(err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Loading contact settings...</Typography>;
  }

  if (!form) {
    return <Typography>Unable to load settings.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Contact Settings</Typography>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Paper sx={{ p: 3, background: '#141414' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Grid>

            <Grid item xs={12} md={6}><TextField fullWidth label="Facebook URL" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Instagram URL" value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="YouTube URL" value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="WhatsApp Number" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} /></Grid>

            <Grid item xs={12} md={6}><TextField fullWidth label="Footer Title" value={form.footerTitle} onChange={(e) => setForm({ ...form, footerTitle: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Copyright Text" value={form.copyrightText} onChange={(e) => setForm({ ...form, copyrightText: e.target.value })} /></Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save Contact Settings'}</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
