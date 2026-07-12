import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import AuthContext from '../../context/AuthContext';
import eventApi from '../../services/eventService';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const auth = useContext(AuthContext);

  useEffect(() => {
    eventApi.getAll().then(setEvents);
  }, []);

  const isAdmin = auth.user?.role === 'Admin';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Events
      </Typography>
      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/events/create" variant="contained">
            Create Event
          </Button>
        </Box>
      )}
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} key={event.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{event.name}</Typography>
                <Typography>{event.category}</Typography>
                <Typography>{event.location}</Typography>
                <Typography>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} to={`/events/${event.id}`} size="small">
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
