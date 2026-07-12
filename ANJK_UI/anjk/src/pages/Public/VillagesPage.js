import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import villageApi from '../../services/villageService';

export default function VillagesPage() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    villageApi.getAll()
      .then((data) => setVillages(data))
      .catch(() => setVillages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Our Villages
      </Typography>
      <Typography paragraph>
        Explore the nine villages of Anjigeri Naad, each with its own history, landmarks, temples, and local families.
      </Typography>
      <Grid container spacing={3}>
        {villages.map((village) => (
          <Grid item xs={12} md={6} key={village.name}>
            <Card sx={{ background: '#141414' }}>
              <CardContent>
                <Typography variant="h6">{village.name}</Typography>
                <Typography>{village.description || 'Discover the village history, temples, schools, and community heritage.'}</Typography>
                <Button component={Link} to={village.path || '/villages'} variant="contained" sx={{ mt: 2 }}>
                  View details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography sx={{ mt: 2 }}>Loading villages from the database...</Typography>}
      {!loading && villages.length === 0 && <Typography sx={{ mt: 2 }}>No village records found in the database.</Typography>}
    </Box>
  );
}
