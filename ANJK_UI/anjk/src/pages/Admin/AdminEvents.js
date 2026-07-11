import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import eventApi from '../../services/eventService';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    eventApi.getAll()
      .then((data) => setEvents(data))
      .catch((error) => console.error('Failed to load events', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Events</Typography>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate('/events/create')}>
        Add Event
      </Button>
      {loading ? (
        <Typography>Loading events...</Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography>{event.category}</Typography>
                  <Typography>{event.location}</Typography>
                  <Typography>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
