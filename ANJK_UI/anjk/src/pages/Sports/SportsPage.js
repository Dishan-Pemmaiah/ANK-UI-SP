import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import sportsApi from '../../services/sportsService';

export default function SportsPage() {
  const [sports, setSports] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    Promise.all([sportsApi.getCategories(), sportsApi.getTournaments()])
      .then(([categories, records]) => {
        setSports(categories);
        setTournaments(records);
      })
      .catch(() => {
        setSports([]);
        setTournaments([]);
      });
  }, []);

  const playedLive = tournaments.filter((item) => item.activityType === 'Played' && item.recordState === 'Live');
  const playedHistory = tournaments.filter((item) => item.activityType === 'Played' && item.recordState === 'History');
  const hostedLive = tournaments.filter((item) => item.activityType === 'Hosted' && item.recordState === 'Live');
  const hostedHistory = tournaments.filter((item) => item.activityType === 'Hosted' && item.recordState === 'History');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sports</Typography>
      <Typography paragraph>
        This page separates what ANJ played and what ANJ hosted, with live and history maintained for each section.
      </Typography>

      <Typography variant="h5" gutterBottom>Sport Categories</Typography>
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Played - Live</Typography>
        <Grid container spacing={3}>
          {playedLive.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card>
                <CardContent>
                  <Chip label="Live" color="error" sx={{ mb: 1 }} />
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>{item.sportName}</Typography>
                  <Typography>{item.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Played - History</Typography>
        <Grid container spacing={3}>
          {playedHistory.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>{item.sportName} • {new Date(item.eventDate).toLocaleDateString()}</Typography>
                  <Typography>{item.result}</Typography>
                  <Typography>{item.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Hosted - Live</Typography>
        <Grid container spacing={3}>
          {hostedLive.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card>
                <CardContent>
                  <Chip label="Live" color="success" sx={{ mb: 1 }} />
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>{item.sportName}</Typography>
                  <Typography>{item.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Hosted - History</Typography>
        <Grid container spacing={3}>
          {hostedHistory.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>{item.sportName} • {new Date(item.eventDate).toLocaleDateString()}</Typography>
                  <Typography>{item.result}</Typography>
                  <Typography>{item.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
