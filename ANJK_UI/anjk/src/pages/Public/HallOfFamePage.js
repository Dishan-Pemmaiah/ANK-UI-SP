import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import hallOfFameApi from '../../services/hallOfFameService';

export default function HallOfFamePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hallOfFameApi.getAll()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]))
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
      {loading && <Typography sx={{ mt: 2 }}>Loading Hall of Fame from the database...</Typography>}
      {!loading && categories.length === 0 && <Typography sx={{ mt: 2 }}>No Hall of Fame records found in the database.</Typography>}
    </Box>
  );
}
