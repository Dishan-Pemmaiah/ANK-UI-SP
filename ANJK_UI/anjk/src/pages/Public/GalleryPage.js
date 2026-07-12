import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, Stack, Paper } from '@mui/material';
import galleryApi from '../../services/galleryService';

const rawGalleryUrls = (process.env.REACT_APP_GALLERY_IMAGE_URLS || '')
  .split(/[,\n]/)
  .map((url) => url.trim())
  .filter(Boolean);

const rawGalleryTitles = (process.env.REACT_APP_GALLERY_IMAGE_TITLES || '')
  .split(/[,\n]/)
  .map((title) => title.trim())
  .filter(Boolean);

const normalizeImageUrl = (url) => {
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }

  const driveOpenMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (url.includes('drive.google.com') && driveOpenMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`;
  }

  return url;
};

const fallbackGalleryItems = rawGalleryUrls.map((imageUrl, index) => ({
  id: `fallback-${index}-${imageUrl}`,
  title: rawGalleryTitles[index] || `Gallery image ${index + 1}`,
  imageUrl: normalizeImageUrl(imageUrl)
}));

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    galleryApi.getAll()
      .then((data) => {
        if (!mounted) return;

        const apiItems = (data || []).map((item, index) => ({
          id: item.id || `api-${index}`,
          title: item.title || item.name || `Gallery image ${index + 1}`,
          imageUrl: normalizeImageUrl(item.imageUrl || item.url || ''),
          description: item.description || ''
        })).filter((item) => item.imageUrl);

        setItems(apiItems.length > 0 ? apiItems : fallbackGalleryItems);
      })
      .catch(() => {
        if (!mounted) return;
        setItems(fallbackGalleryItems);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="overline" sx={{ letterSpacing: 3, color: '#d9b18f' }}>
        Gallery
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
        Shared Gallery
      </Typography>
      <Typography sx={{ mb: 3, maxWidth: 760, color: 'rgba(255,255,255,0.78)' }}>
        Admin-added gallery images show here for everyone. Public Google Drive links are also supported as a fallback when needed.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
        <Button component="a" href="https://drive.google.com" target="_blank" rel="noreferrer" variant="outlined" color="inherit">
          Open Google Drive
        </Button>
        <Button component="a" href="/contact" variant="contained">
          Share more images
        </Button>
      </Stack>

      {loading ? (
        <Paper sx={{ p: 3, background: '#141414' }}>
          <Typography sx={{ fontWeight: 700 }}>Loading gallery...</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id || item.title}>
            <Card sx={{ background: '#141414', height: '100%' }}>
              <CardMedia component="img" height="220" image={item.imageUrl} alt={item.title} sx={{ objectFit: 'cover' }} />
              <CardContent>
                <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                {item.description ? (
                  <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.72)' }}>{item.description}</Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}
      {!loading && items.length === 0 && (
        <Paper sx={{ mt: 3, p: 3, background: '#141414' }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>No gallery items available yet</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
            Ask an admin to add gallery images, or add public Drive links in the site settings if you are using the fallback mode.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
