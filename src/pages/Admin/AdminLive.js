import { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import liveApi from '../../services/liveService';

const normalizeYouTubeUrl = (value) => {
  if (!value) return '';

  if (value.includes('youtube.com/embed/')) {
    return value;
  }

  const watchMatch = value.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = value.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  if (/^[a-zA-Z0-9_-]{8,}$/.test(value)) {
    return `https://www.youtube.com/embed/${value}`;
  }

  return value;
};

export default function AdminLive() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [streamLink, setStreamLink] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadLive = () => {
    return Promise.all([liveApi.getCurrent(), liveApi.getHistory()])
      .then(([currentData, historyData]) => {
        setCurrent(currentData);
        setHistory(historyData);
      })
      .catch((error) => console.error('Failed to load live status', error));
  };

  useEffect(() => {
    loadLive().finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async () => {
    const cleanedMessage = message.trim();
    const cleanedLink = streamLink.trim();

    if (!cleanedMessage && !cleanedLink) return;
    setSending(true);
    try {
      const payload = [
        cleanedMessage,
        cleanedLink ? normalizeYouTubeUrl(cleanedLink) : ''
      ].filter(Boolean).join('\n');

      if (editingId) {
        await liveApi.update(editingId, payload);
      } else {
        await liveApi.broadcast(payload);
      }

      setMessage('');
      setStreamLink('');
      setEditingId(null);
      await loadLive();
    } catch (error) {
      console.error('Failed to send live broadcast', error);
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (item) => {
    const text = String(item.message || item.description || '').trim();
    const link = text.match(/https?:\/\/[^\s]+/i)?.[0] || '';
    const plainMessage = link ? text.replace(link, '').trim() : text;

    setEditingId(item.id);
    setMessage(plainMessage);
    setStreamLink(link);
  };

  const handleDelete = async (id) => {
    try {
      await liveApi.delete(id);
      if (editingId === id) {
        setEditingId(null);
        setMessage('');
        setStreamLink('');
      }
      await loadLive();
    } catch (error) {
      console.error('Failed to delete live update', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMessage('');
    setStreamLink('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Live Update Controls</Typography>
      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        Add a live message and optional YouTube link. Public users will see the same update and can watch the stream directly.
      </Typography>
      {loading ? (
        <Typography>Loading live status...</Typography>
      ) : (
        <Paper sx={{ p: 3, background: '#141414' }}>
          {current ? (
            <Box>
              <Typography variant="h6">Current Live Update</Typography>
              <Typography>{current.message || current.description || 'No current live message.'}</Typography>
              {(() => {
                const currentText = String(current.message || current.description || '');
                const currentLink = currentText.match(/https?:\/\/[^\s]+/i)?.[0];
                return currentLink ? (
                  <Button
                    component="a"
                    href={currentLink}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Open current stream
                  </Button>
                ) : null;
              })()}
            </Box>
          ) : (
            <Typography>No live status available.</Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Live History</Typography>
            {history.length ? history.map((item) => (
              <Box key={item.id} sx={{ mb: 1.5, p: 1.25, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 1.5 }}>
                <Typography sx={{ opacity: 0.9 }}>
                  {new Date(item.createdOn).toLocaleString()} - {item.message}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEdit(item)}>Edit</Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(item.id)}>Delete</Button>
                </Box>
              </Box>
            )) : <Typography>No history available.</Typography>}
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              label={editingId ? 'Edit message' : 'Broadcast message'}
              fullWidth
              multiline
              minRows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              helperText="Add the update text that public users should see."
              sx={{ mb: 2 }}
            />
            <TextField
              label="YouTube stream link"
              fullWidth
              value={streamLink}
              onChange={(e) => setStreamLink(e.target.value)}
              helperText="Optional. Paste a YouTube watch link, short link, embed link, or video ID."
            />
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleBroadcast} disabled={sending || (!message.trim() && !streamLink.trim())}>
              {sending ? 'Saving...' : (editingId ? 'Update Broadcast' : 'Send Broadcast')}
            </Button>
            {editingId ? (
              <Button sx={{ mt: 2, ml: 1 }} variant="outlined" onClick={handleCancelEdit}>
                Cancel Edit
              </Button>
            ) : null}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
