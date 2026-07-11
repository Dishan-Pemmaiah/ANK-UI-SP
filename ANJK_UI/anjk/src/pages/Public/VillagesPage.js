import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import villageApi from '../../services/villageService';

const fallbackVillages = [
  { name: 'Hudikeri', path: '/villages/hudikeri' },
  { name: 'Konageri', path: '/villages/konageri' },
  { name: 'Hysudloor', path: '/villages/hysudloor' },
  { name: 'Begur', path: '/villages/begur' },
  { name: 'Mugutageri', path: '/villages/mugutageri' },
  { name: 'Nadikeri', path: '/villages/nadikeri' },
  { name: 'Thuchamakeri', path: '/villages/thuchamakeri' },
  { name: 'Chikkamundur', path: '/villages/chikkamundur' },
  { name: 'Baliamandur', path: '/villages/baliamandur' }
];

export default function VillagesPage() {
  const [villages, setVillages] = useState(fallbackVillages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    villageApi.getAll()
      .then((data) => setVillages(data))
      .catch(() => setVillages(fallbackVillages))
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
      {loading && <Typography sx={{ mt: 2 }}>Loading villages...</Typography>}
    </Box>
  );
}
