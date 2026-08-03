import { useEffect, useState } from 'react';
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import siteContentService, { SITE_CONTENT_KEYS } from '../../services/siteContentService';

const instagramFallback = 'https://www.instagram.com/anjigeri_naad_club?igsh=NmYxbjc2bnBob3Bj';

const emptyForm = {
  contactIntro: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactInstagramUrl: instagramFallback,
  footerTagline: ''
};

export default function ContactSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    siteContentService.getAll()
      .then((data) => {
        setForm({
          contactIntro: data[SITE_CONTENT_KEYS.contactIntro] || 'Use the form for general messages, or follow the club on Instagram for photos, updates, and announcements.',
          contactEmail: data[SITE_CONTENT_KEYS.contactEmail] || '',
          contactPhone: data[SITE_CONTENT_KEYS.contactPhone] || '',
          contactAddress: data[SITE_CONTENT_KEYS.contactAddress] || '',
          contactInstagramUrl: data[SITE_CONTENT_KEYS.contactInstagramUrl] || instagramFallback,
          footerTagline: data[SITE_CONTENT_KEYS.footerTagline] || 'Anjigeri Naad Koota: Community, sport, and heritage together.'
        });
      })
      .catch((error) => {
        setErrorMessage(error?.message || 'Failed to load contact/footer content settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await siteContentService.saveContactFooterContent(form);
      setSuccessMessage('Contact and footer content saved successfully.');
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save contact/footer content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Contact and Footer CMS</Typography>
      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        Manage contact details and footer one-line text shown on public pages.
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
                <TextField fullWidth multiline rows={3} label="Contact Intro" value={form.contactIntro} onChange={(e) => setForm({ ...form, contactIntro: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contact Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Contact Address" value={form.contactAddress} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Instagram URL" value={form.contactInstagramUrl} onChange={(e) => setForm({ ...form, contactInstagramUrl: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Footer Tagline (1-2 lines)" value={form.footerTagline} onChange={(e) => setForm({ ...form, footerTagline: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save Contact and Footer Content'}</Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
