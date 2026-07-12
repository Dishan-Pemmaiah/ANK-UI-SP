import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import eventApi from '../../services/eventService';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const payment = 0;
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      eventApi.getById(id).then(setEvent);
    }
  }, [id]);

  const handleRegister = async () => {
    await eventApi.register(id, payment);
    setMessage('Registration completed.');
  };

  if (!event) {
    return <Typography>Loading event...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{event.name}</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography>{event.description}</Typography>
        <Typography>Location: {event.location}</Typography>
        <Typography>Category: {event.category}</Typography>
        <Typography>Fee: {event.fee}</Typography>
      </Paper>
      <Box>
        <Typography variant="h6">Register for event</Typography>
        <Button variant="contained" onClick={handleRegister} sx={{ mt: 2 }}>
          Register & Pay
        </Button>
        {message && <Typography color="success.main" sx={{ mt: 2 }}>{message}</Typography>}
      </Box>
    </Box>
  );
}
