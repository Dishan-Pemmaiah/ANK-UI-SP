import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import newsApi from '../../services/newsService';
import { useEffect, useState } from 'react';

const formatDate = (value) => {
  if (!value) {
    return 'Date not available';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Date not available' : parsed.toLocaleDateString();
};

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    newsApi.getAll()
      .then((items) => {
        if (!mounted) {
          return;
        }
        setNews(Array.isArray(items) ? items : []);
        setError('');
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setNews([]);
        setError('Unable to load news right now. Please try again shortly.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        News & Announcements
      </Typography>
      {loading ? <Typography sx={{ mb: 2 }}>Loading news...</Typography> : null}
      {error ? <Typography sx={{ mb: 2, color: '#ff9b9b' }}>{error}</Typography> : null}
      {!loading && !error && news.length === 0 ? <Typography sx={{ mb: 2 }}>No news has been published yet.</Typography> : null}
      <Grid container spacing={3}>
        {news.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.title || item.heading || 'Untitled news item'}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(item.publishedOn || item.createdOn || item.date)}
                </Typography>
                <Typography>{item.content || item.description || item.message || 'No details available.'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
