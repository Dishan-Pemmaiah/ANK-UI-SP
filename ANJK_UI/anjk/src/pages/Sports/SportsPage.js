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
  const sections = [
    { title: 'Played - Live', items: playedLive, liveColor: 'error' },
    { title: 'Played - History', items: playedHistory },
    { title: 'Hosted - Live', items: hostedLive, liveColor: 'success' },
    { title: 'Hosted - History', items: hostedHistory }
  ].filter((section) => section.items.length > 0);

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

      {sections.map((section) => (
        <Box sx={{ mt: 4 }} key={section.title}>
          <Typography variant="h5" gutterBottom>{section.title}</Typography>
          <Grid container spacing={3}>
            {section.items.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card>
                  <CardContent>
                    {section.liveColor ? <Chip label="Live" color={section.liveColor} sx={{ mb: 1 }} /> : null}
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography>{item.sportName}{item.eventDate ? ` • ${new Date(item.eventDate).toLocaleDateString()}` : ''}</Typography>
                    {item.result ? <Typography>{item.result}</Typography> : null}
                    <Typography>{item.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {sections.length === 0 ? (
        <Box sx={{ mt: 4 }}>
          <Typography>No sports records available yet.</Typography>
        </Box>
      ) : null}
    </Box>
  );
}
