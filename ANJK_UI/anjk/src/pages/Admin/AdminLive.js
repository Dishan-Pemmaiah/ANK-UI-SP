import { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import liveApi from '../../services/liveService';

export default function AdminLive() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    liveApi.getStatus()
      .then((data) => setStatus(data))
      .catch((error) => console.error('Failed to load live status', error))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async () => {
    if (!message) return;
    setSending(true);
    try {
      await liveApi.broadcast(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send live broadcast', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Live Update Controls</Typography>
      {loading ? (
        <Typography>Loading live status...</Typography>
      ) : (
        <Paper sx={{ p: 3, background: '#141414' }}>
          {status ? (
            <Box>
              <Typography variant="h6">{status.title}</Typography>
              <Typography>{status.description}</Typography>
              <Typography sx={{ mt: 1 }}>
                {status.teamA} {status.scoreA} - {status.scoreB} {status.teamB}
              </Typography>
              <Typography>{status.liveStatus}</Typography>
            </Box>
          ) : (
            <Typography>No live status available.</Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <TextField
              label="Broadcast message"
              fullWidth
              multiline
              minRows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleBroadcast} disabled={sending || !message}>
              {sending ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
