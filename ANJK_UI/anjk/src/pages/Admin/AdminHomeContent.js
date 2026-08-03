import { useEffect, useState } from 'react';
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import siteContentService, { SITE_CONTENT_KEYS } from '../../services/siteContentService';

const emptyForm = {
  homeHeroTitle: '',
  homeHeroSubtitle: '',
  homePrimaryCtaLabel: '',
  homePrimaryCtaPath: '',
  homeSecondaryCtaLabel: '',
  homeSecondaryCtaPath: '',
  homeContactBanner: ''
};

export default function AdminHomeContent() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    siteContentService.getAll()
      .then((data) => {
        setForm({
          homeHeroTitle: data[SITE_CONTENT_KEYS.homeHeroTitle] || 'Anjigeri Naad Koota',
          homeHeroSubtitle: data[SITE_CONTENT_KEYS.homeHeroSubtitle] || 'A bold home for Kodava heritage, competitive sport, village unity, live updates, and club history - built from the database, not static copy.',
          homePrimaryCtaLabel: data[SITE_CONTENT_KEYS.homePrimaryCtaLabel] || 'Explore ANK',
          homePrimaryCtaPath: data[SITE_CONTENT_KEYS.homePrimaryCtaPath] || '/about',
          homeSecondaryCtaLabel: data[SITE_CONTENT_KEYS.homeSecondaryCtaLabel] || 'View sports history',
          homeSecondaryCtaPath: data[SITE_CONTENT_KEYS.homeSecondaryCtaPath] || '/sports',
          homeContactBanner: data[SITE_CONTENT_KEYS.homeContactBanner] || 'Keep the homepage clean while still giving visitors an easy way to reach the club or follow updates.'
        });
      })
      .catch((error) => {
        setErrorMessage(error?.message || 'Failed to load home content settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await siteContentService.saveHomeContent(form);
      setSuccessMessage('Home CMS content saved successfully.');
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save home content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Home Content CMS</Typography>
      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        Manage hero text and home call-to-action links from admin.
      </Typography>
      {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}
      {successMessage ? <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert> : null}

      <Paper sx={{ p: 3, background: '#141414' }}>
        {loading ? (
          <Typography>Loading CMS content...</Typography>
        ) : (
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Hero Title" value={form.homeHeroTitle} onChange={(e) => setForm({ ...form, homeHeroTitle: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label="Hero Subtitle" value={form.homeHeroSubtitle} onChange={(e) => setForm({ ...form, homeHeroSubtitle: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Primary CTA Label" value={form.homePrimaryCtaLabel} onChange={(e) => setForm({ ...form, homePrimaryCtaLabel: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Primary CTA Path" value={form.homePrimaryCtaPath} onChange={(e) => setForm({ ...form, homePrimaryCtaPath: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Secondary CTA Label" value={form.homeSecondaryCtaLabel} onChange={(e) => setForm({ ...form, homeSecondaryCtaLabel: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Secondary CTA Path" value={form.homeSecondaryCtaPath} onChange={(e) => setForm({ ...form, homeSecondaryCtaPath: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Home Contact Banner Text" value={form.homeContactBanner} onChange={(e) => setForm({ ...form, homeContactBanner: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save Home Content'}</Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}