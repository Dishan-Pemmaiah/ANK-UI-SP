import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper, Divider, Button, Stack, Chip } from '@mui/material';
import newsApi from '../../services/newsService';
import liveApi from '../../services/liveService';

const formatDateTime = (value) => {
  if (!value) {
    return 'Date not available';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Date not available' : parsed.toLocaleString();
};

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

const toWatchUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  const embedMatch = text.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  if (embedMatch) {
    return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
  }

  return text;
};

const parseBroadcastText = (value) => {
  const text = String(value || '').trim();
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  const streamUrl = urlMatch ? normalizeYouTubeUrl(urlMatch[0]) : '';
  const message = urlMatch ? text.replace(urlMatch[0], '').trim() : text;

  return {
    message: message || text,
    streamUrl
  };
};

export default function UpdatesPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [currentLive, setCurrentLive] = useState(null);
  const [liveHistory, setLiveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      newsApi.getAll().catch(() => []),
      liveApi.getCurrent().catch(() => null),
      liveApi.getHistory().catch(() => [])
    ]).then(([newsData, currentData, historyData]) => {
      if (!mounted) {
        return;
      }

      setNewsItems(Array.isArray(newsData) ? newsData : []);
      setCurrentLive(currentData || null);
      setLiveHistory(Array.isArray(historyData) ? historyData : []);
      setLoading(false);
    });

    const interval = setInterval(() => {
      Promise.all([
        newsApi.getAll().catch(() => []),
        liveApi.getCurrent().catch(() => null),
        liveApi.getHistory().catch(() => [])
      ]).then(([newsData, currentData, historyData]) => {
        if (!mounted) {
          return;
        }

        setNewsItems(Array.isArray(newsData) ? newsData : []);
        setCurrentLive(currentData || null);
        setLiveHistory(Array.isArray(historyData) ? historyData : []);
      });
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentText = String(currentLive?.message || currentLive?.description || currentLive?.title || '').trim();
  const currentParsed = parseBroadcastText(currentText);
  const explicitLiveLink = normalizeYouTubeUrl(currentLive?.streamUrl || currentLive?.youtubeUrl || currentLive?.streamLink || '');
  const currentStreamUrl = explicitLiveLink || currentParsed.streamUrl;
  const currentOpenUrl = toWatchUrl(currentStreamUrl);

  const recentLiveItems = useMemo(() => {
    const seen = new Set();

    return [currentLive, ...(Array.isArray(liveHistory) ? liveHistory : [])]
      .filter(Boolean)
      .map((item, index) => {
        const text = String(item?.message || item?.description || item?.title || '').trim();
        const parsed = parseBroadcastText(text);
        const explicit = normalizeYouTubeUrl(item?.streamUrl || item?.youtubeUrl || item?.streamLink || '');
        const streamUrl = explicit || parsed.streamUrl;

        return {
          id: item?.id || `live-item-${index}`,
          title: item?.title || `Live update ${index + 1}`,
          message: parsed.message || 'Live update shared by admin',
          streamUrl,
          openUrl: toWatchUrl(streamUrl),
          createdOn: item?.createdOn || item?.createdAt || ''
        };
      })
      .filter((item) => {
        const key = item.id || `${item.message}|${item.createdOn}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [currentLive, liveHistory]);

  return (
    <Box>
      <Typography variant="overline" sx={{ letterSpacing: 3, color: '#d9b18f' }}>
        Club Updates
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
        Updates
      </Typography>
      <Typography sx={{ mb: 3, maxWidth: 760, color: 'rgba(255,255,255,0.78)' }}>
        One place for all public updates: announcements, live broadcast links, and replay history.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, backgroundColor: '#11151d', mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip size="small" color="error" label="Live" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Current Broadcast</Typography>
            </Stack>

            {currentStreamUrl ? (
              <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden', background: '#000', mb: 2 }}>
                <Box
                  component="iframe"
                  src={currentStreamUrl}
                  title="ANK live stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              </Box>
            ) : (
              <Box sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  No live stream linked yet.
                </Typography>
              </Box>
            )}

            <Typography sx={{ color: 'rgba(255,255,255,0.82)' }}>
              {currentParsed.message || 'No current live message.'}
            </Typography>
            {currentOpenUrl ? (
              <Button component="a" href={currentOpenUrl} target="_blank" rel="noreferrer" variant="contained" sx={{ mt: 2 }}>
                Open stream
              </Button>
            ) : null}
          </Paper>

          <Paper sx={{ p: { xs: 2.5, md: 3 }, backgroundColor: '#121212' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Replay History</Typography>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />
            {recentLiveItems.length ? (
              <Stack spacing={1.25}>
                {recentLiveItems.map((item) => (
                  <Paper key={item.id} sx={{ p: 1.5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                      {item.message}
                    </Typography>
                    {item.openUrl ? (
                      <Button component="a" href={item.openUrl} target="_blank" rel="noreferrer" color="inherit" variant="outlined" sx={{ mt: 1.25 }}>
                        Open replay
                      </Button>
                    ) : null}
                    {item.createdOn ? (
                      <Typography sx={{ mt: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                        {formatDateTime(item.createdOn)}
                      </Typography>
                    ) : null}
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>Replay history will appear here after updates are posted.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>News & Announcements</Typography>
          <Grid container spacing={2}>
            {loading ? <Grid item xs={12}><Typography>Loading updates...</Typography></Grid> : null}
            {!loading && newsItems.length === 0 ? <Grid item xs={12}><Typography>No news has been published yet.</Typography></Grid> : null}
            {newsItems.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card sx={{ background: '#141414' }}>
                  <CardContent>
                    <Typography variant="h6">{item.title || item.heading || 'Untitled news item'}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDateTime(item.publishedOn || item.createdOn || item.createdAt || item.date)}
                    </Typography>
                    <Typography>{item.content || item.description || item.message || 'No details available.'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
