import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, Button, Grid, Card, CardContent, Stack } from '@mui/material';
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

const parseBroadcastText = (value) => {
  const text = String(value || '').trim();
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  const streamUrl = urlMatch ? normalizeYouTubeUrl(urlMatch[0]) : '';
  const message = urlMatch ? text.replace(urlMatch[0], '').trim() : text;

  return {
    text,
    message: message || text,
    streamUrl
  };
};

const parseHistoryItem = (item, index) => {
  const rawText = String(item?.message || item?.description || '').trim();
  const parsed = parseBroadcastText(rawText);

  return {
    id: item?.id || `history-${index}`,
    title: item?.title || `Live update ${index + 1}`,
    message: parsed.message,
    streamUrl: parsed.streamUrl,
    createdOn: item?.createdOn || item?.createdAt || ''
  };
};

export default function LivePage() {
  const [currentUpdate, setCurrentUpdate] = useState(null);
  const [history, setHistory] = useState([]);

  const refreshLive = () => {
    liveApi.getCurrent().then((data) => setCurrentUpdate(data || null)).catch(() => setCurrentUpdate(null));
    liveApi.getHistory().then((data) => setHistory(Array.isArray(data) ? data : [])).catch(() => setHistory([]));
  };

  useEffect(() => {
    refreshLive();

    const interval = setInterval(() => {
      refreshLive();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const currentText = String(currentUpdate?.message || currentUpdate?.description || currentUpdate?.title || '').trim();
  const currentBroadcast = parseBroadcastText(currentText);
  const currentHasStream = Boolean(currentBroadcast.streamUrl);
  const liveItems = [currentUpdate, ...history]
    .filter(Boolean)
    .map((item, index) => parseHistoryItem(item, index))
    .slice(0, 6);

  return (
    <Box>
      <Typography variant="overline" sx={{ letterSpacing: 3, color: '#d9b18f' }}>
        Live Coverage
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
        Watch tournament streams here
      </Typography>
      <Typography sx={{ mb: 3, maxWidth: 760, color: 'rgba(255,255,255,0.78)' }}>
        When an admin broadcasts a tournament link, the public page shows the same stream and message for everyone.
      </Typography>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, backgroundColor: '#11151d' }}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={8}>
            {currentHasStream ? (
              <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden', background: '#000' }}>
                <Box
                  component="iframe"
                  src={currentBroadcast.streamUrl}
                  title="ANK live stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              </Box>
            ) : (
              <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', borderRadius: 2, border: '1px dashed rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.03)', p: 3, textAlign: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No live stream linked yet</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Once an admin shares a YouTube link, the live stream will appear here automatically.
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>Current live update</Typography>
                  <Typography sx={{ mt: 1, fontWeight: 800 }}>Shared by admin</Typography>
                  <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                    {currentBroadcast.message || 'No current live message.'}
                  </Typography>
                  {currentBroadcast.streamUrl ? (
                    <Button component="a" href={currentBroadcast.streamUrl} target="_blank" rel="noreferrer" variant="contained" sx={{ mt: 2 }}>
                      Open stream on YouTube
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ letterSpacing: 2, color: '#d9b18f' }}>Replay list</Typography>
                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />
                  {liveItems.length > 0 ? (
                    <Stack spacing={1.25}>
                      {liveItems.map((item) => (
                        <Paper key={item.id} sx={{ p: 1.5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                            {item.message || 'Live update shared by admin'}
                          </Typography>
                          {item.streamUrl ? (
                            <Button component="a" href={item.streamUrl} target="_blank" rel="noreferrer" color="inherit" variant="outlined" sx={{ mt: 1.25 }}>
                              Open replay
                            </Button>
                          ) : null}
                          {item.createdOn ? (
                            <Typography sx={{ mt: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                              {new Date(item.createdOn).toLocaleString()}
                            </Typography>
                          ) : null}
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
                      Replay history will appear here after an admin shares previous live links.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
