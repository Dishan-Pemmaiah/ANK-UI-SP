import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
import galleryApi from '../../services/galleryService';

const fallbackGallery = [
  { id: 1, title: 'Football Final', imageUrl: 'https://via.placeholder.com/400x250' },
  { id: 2, title: 'Kabaddi Match', imageUrl: 'https://via.placeholder.com/400x250' },
  { id: 3, title: 'Training Session', imageUrl: 'https://via.placeholder.com/400x250' }
];

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState(fallbackGallery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryApi.getAll()
      .then((data) => setGalleryItems(data))
      .catch(() => setGalleryItems(fallbackGallery))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gallery
      </Typography>
      <Grid container spacing={3}>
        {galleryItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id || item.title}>
            <Card>
              <CardMedia component="img" height="200" image={item.imageUrl} alt={item.title} />
              <CardContent>
                <Typography>{item.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography sx={{ mt: 2 }}>Loading gallery...</Typography>}
    </Box>
  );
}
