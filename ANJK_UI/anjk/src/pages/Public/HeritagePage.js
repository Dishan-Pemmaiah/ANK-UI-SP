import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import heritageApi from '../../services/heritageService';

export default function HeritagePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    heritageApi.getAll()
      .then((data) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Heritage of Anjigeri Naad
      </Typography>
      <Typography paragraph>
        Heritage content is now stored in the database. Admins can add, edit, or delete the sections below.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {items.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card sx={{ background: '#141414' }}>
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography>{item.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
