import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import newsApi from '../../services/newsService';
import liveApi from '../../services/liveService';

const emptyNews = { title: '', content: '' };

const normalizeYouTubeUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  if (text.includes('youtube.com/embed/')) {
    return text;
  }

  const liveOrShortsMatch = text.match(/youtube\.com\/(?:live|shorts)\/([a-zA-Z0-9_-]+)/i);
  if (liveOrShortsMatch) {
    return `https://www.youtube.com/embed/${liveOrShortsMatch[1]}`;
  }

  const watchMatch = text.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = text.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  if (/^[a-zA-Z0-9_-]{8,}$/.test(text)) {
    return `https://www.youtube.com/embed/${text}`;
  }

  return text;
};

export default function AdminUpdates() {
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [editingNewsId, setEditingNewsId] = useState(null);

  const [currentLive, setCurrentLive] = useState(null);
  const [liveHistory, setLiveHistory] = useState([]);
  const [liveMessage, setLiveMessage] = useState('');
  const [streamLink, setStreamLink] = useState('');
  const [editingLiveId, setEditingLiveId] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveSaving, setLiveSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadNews = () => {
    setNewsLoading(true);
    return newsApi.getAll()
      .then((data) => setNewsItems(Array.isArray(data) ? data : []))
      .catch((error) => {
        setErrorMessage(error?.message || 'Failed to load news items.');
      })
      .finally(() => setNewsLoading(false));
  };

  const loadLive = () => {
    setLiveLoading(true);
    return Promise.all([liveApi.getCurrent(), liveApi.getHistory()])
      .then(([currentData, historyData]) => {
        setCurrentLive(currentData || null);
        setLiveHistory(Array.isArray(historyData) ? historyData : []);
      })
      .catch((error) => {
        setErrorMessage(error?.message || 'Failed to load live updates.');
      })
      .finally(() => setLiveLoading(false));
  };

  useEffect(() => {
    loadNews();
    loadLive();
  }, []);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsForm(emptyNews);
  };

  const startNewsEdit = (item) => {
    setEditingNewsId(item.id);
    setNewsForm({ title: item.title || '', content: item.content || '' });
  };

  const handleNewsSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    try {
      const saved = editingNewsId
        ? await newsApi.update(editingNewsId, newsForm)
        : await newsApi.create(newsForm);

      setNewsItems((prev) => editingNewsId
        ? prev.map((item) => (item.id === editingNewsId ? saved : item))
        : [saved, ...prev]);

      setSuccessMessage(editingNewsId ? 'News item updated.' : 'News item created.');
      resetNewsForm();
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save news item.');
    }
  };

  const handleNewsDelete = async (id) => {
    clearMessages();

    try {
      await newsApi.delete(id);
      setNewsItems((prev) => prev.filter((item) => item.id !== id));
      if (editingNewsId === id) {
        resetNewsForm();
      }
      setSuccessMessage('News item deleted.');
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to delete news item.');
    }
  };

  const handleLiveEdit = (item) => {
    const text = String(item.message || item.description || '').trim();
    const link = item.streamUrl || item.youtubeUrl || text.match(/https?:\/\/[^\s]+/i)?.[0] || '';
    const plainMessage = link ? text.replace(link, '').trim() : text;

    setEditingLiveId(item.id);
    setLiveMessage(plainMessage);
    setStreamLink(link);
  };

  const handleCancelLiveEdit = () => {
    setEditingLiveId(null);
    setLiveMessage('');
    setStreamLink('');
  };

  const handleLiveSave = async () => {
    const cleanedMessage = liveMessage.trim();
    const cleanedLink = streamLink.trim();
    if (!cleanedMessage && !cleanedLink) return;

    clearMessages();
    setLiveSaving(true);

    try {
      const normalizedLink = cleanedLink ? normalizeYouTubeUrl(cleanedLink) : '';
      const payload = {
        message: cleanedMessage,
        description: cleanedMessage,
        streamUrl: normalizedLink,
        youtubeUrl: normalizedLink
      };

      if (editingLiveId) {
        await liveApi.update(editingLiveId, payload);
      } else {
        await liveApi.broadcast(payload);
      }

      await loadLive();
      setSuccessMessage(editingLiveId ? 'Live update edited.' : 'Live update sent.');
      handleCancelLiveEdit();
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save live update.');
    } finally {
      setLiveSaving(false);
    }
  };

  const handleLiveDelete = async (id) => {
    clearMessages();

    try {
      await liveApi.delete(id);
      if (editingLiveId === id) {
        handleCancelLiveEdit();
      }
      await loadLive();
      setSuccessMessage('Live update deleted.');
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to delete live update.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Updates</Typography>
      <Typography sx={{ opacity: 0.8, mb: 2 }}>
        News and live broadcast updates are managed together in one CMS page.
      </Typography>

      {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}
      {successMessage ? <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert> : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, background: '#141414' }}>
            <Typography variant="h6" gutterBottom>{editingNewsId ? 'Edit News Item' : 'Add News Item'}</Typography>
            <Box component="form" onSubmit={handleNewsSubmit}>
              <Stack spacing={2}>
                <TextField fullWidth label="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required />
                <TextField fullWidth multiline rows={4} label="Content" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} required />
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained">{editingNewsId ? 'Update News' : 'Add News'}</Button>
                  {editingNewsId ? <Button onClick={resetNewsForm}>Cancel</Button> : null}
                </Stack>
              </Stack>
            </Box>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>News List</Typography>
            {newsLoading ? <Typography>Loading news...</Typography> : (
              <Stack spacing={1.2}>
                {newsItems.map((item) => (
                  <Card key={item.id} sx={{ background: '#191919' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                      <Typography sx={{ mt: 0.75, opacity: 0.82 }}>{item.content}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                        <Button size="small" variant="outlined" onClick={() => startNewsEdit(item)}>Edit</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleNewsDelete(item.id)}>Delete</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!newsItems.length ? <Typography>No news items yet.</Typography> : null}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, background: '#141414' }}>
            <Typography variant="h6" gutterBottom>{editingLiveId ? 'Edit Live Broadcast' : 'Send Live Broadcast'}</Typography>
            <Stack spacing={2}>
              <TextField
                label={editingLiveId ? 'Edit message' : 'Broadcast message'}
                fullWidth
                multiline
                minRows={2}
                value={liveMessage}
                onChange={(e) => setLiveMessage(e.target.value)}
                helperText="Add update text shown to public users."
              />
              <TextField
                label="YouTube stream link"
                fullWidth
                value={streamLink}
                onChange={(e) => setStreamLink(e.target.value)}
                helperText="Optional YouTube watch link, short link, embed link, or video ID."
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={handleLiveSave} disabled={liveSaving || (!liveMessage.trim() && !streamLink.trim())}>
                  {liveSaving ? 'Saving...' : (editingLiveId ? 'Update Broadcast' : 'Send Broadcast')}
                </Button>
                {editingLiveId ? <Button variant="outlined" onClick={handleCancelLiveEdit}>Cancel Edit</Button> : null}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Current Live</Typography>
            {liveLoading ? <Typography>Loading live status...</Typography> : (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ opacity: 0.9 }}>{currentLive?.message || currentLive?.description || 'No current live update.'}</Typography>
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mb: 1 }}>Live History</Typography>
            {liveLoading ? <Typography>Loading history...</Typography> : (
              <Stack spacing={1.2}>
                {liveHistory.map((item) => (
                  <Card key={item.id} sx={{ background: '#191919' }}>
                    <CardContent>
                      <Typography sx={{ opacity: 0.85 }}>
                        {item.createdOn ? new Date(item.createdOn).toLocaleString() : 'Unknown date'}
                      </Typography>
                      <Typography sx={{ mt: 0.75 }}>{item.message || item.description || 'Live update'}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                        <Button size="small" variant="outlined" onClick={() => handleLiveEdit(item)}>Edit</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleLiveDelete(item.id)}>Delete</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!liveHistory.length ? <Typography>No live history yet.</Typography> : null}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
