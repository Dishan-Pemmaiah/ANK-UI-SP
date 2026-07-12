import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import newsApi from '../../services/newsService';
import { useEffect, useState } from 'react';

export default function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    newsApi.getAll().then(setNews);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        News & Announcements
      </Typography>
      <Grid container spacing={3}>
        {news.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(item.publishedOn).toLocaleDateString()}
                </Typography>
                <Typography>{item.content}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
