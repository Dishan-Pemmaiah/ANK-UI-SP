import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import apiClient from '../../services/apiClient';

export default function SportsPage() {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    apiClient.get('/Sports/categories').then((res) => setSports(res.data));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sports</Typography>
      <Grid container spacing={3}>
        {sports.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{category.name}</Typography>
                <Typography>{category.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
