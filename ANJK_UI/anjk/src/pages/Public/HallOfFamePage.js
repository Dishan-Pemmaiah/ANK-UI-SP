import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import hallOfFameApi from '../../services/hallOfFameService';

const fallbackCategories = [
  { id: 1, title: 'Armed Forces', description: 'Recognizing community members who served in the armed forces.' },
  { id: 2, title: 'Sports', description: 'Honoring athletic excellence across Kodava sports.' },
  { id: 3, title: 'Education', description: 'Celebrating those who advanced education in the region.' },
  { id: 4, title: 'Civil Services', description: 'Recognizing public servants from our community.' },
  { id: 5, title: 'Doctors', description: 'Honoring healthcare professionals and medical leadership.' },
  { id: 6, title: 'Engineers', description: 'Celebrating engineers who helped build local infrastructure.' },
  { id: 7, title: 'Entrepreneurs', description: 'Recognizing business leaders and innovators.' },
  { id: 8, title: 'Artists', description: 'Honoring Kodava artists, performers, and cultural storytellers.' },
  { id: 9, title: 'Social workers', description: 'Recognizing social service and community development leaders.' }
];

export default function HallOfFamePage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hallOfFameApi.getAll()
      .then((data) => setCategories(data))
      .catch(() => setCategories(fallbackCategories))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hall of Fame
      </Typography>
      <Typography paragraph>
        Our Hall of Fame honors Anjigeri Naad members who have excelled in service, sport, education, and leadership.
      </Typography>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category.id || category.title}>
            <Card sx={{ background: '#141414' }}>
              <CardContent>
                <Typography variant="h6">{category.title || category}</Typography>
                <Typography>
                  {category.description || 'Recognizing key contributors from our community. Submit names and stories to preserve their legacy.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography sx={{ mt: 2 }}>Loading Hall of Fame...</Typography>}
    </Box>
  );
}
