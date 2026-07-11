import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: 'KHPL Champion Alert',
    description: 'Anjigeri Naad team has brought home the recent Kodava Hockey Premier League title with strong team spirit.',
    action: { label: 'Read news', path: '/news' }
  },
  {
    title: 'Upcoming Sports Festival',
    description: 'Join our next club event featuring hockey, fitness camps, and youth training across the nine villages.',
    action: { label: 'View events', path: '/events' }
  },
  {
    title: 'Live Match Coverage',
    description: 'Stay updated with live scores and match commentary from ANK fixtures and community tournaments.',
    action: { label: 'Open live', path: '/live' }
  }
];

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Paper sx={{ background: '#0d3d2f', color: '#fff', p: 6, borderRadius: 3, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Anjigeri Naad Koota (ANK)
        </Typography>
        <Typography variant="h6" gutterBottom>
          A community sports club celebrating Kodava heritage, hockey excellence, and village unity.
        </Typography>
        <Button component={Link} to="/about" variant="contained" sx={{ mt: 2 }}>
          Learn more
        </Button>
      </Paper>

      <Paper sx={{ p: 4, mb: 4, background: '#111111', color: '#fff' }}>
        <Typography variant="h5" gutterBottom>
          Featured ANK Updates
        </Typography>
        <Typography variant="h4" gutterBottom>
          {slides[activeIndex].title}
        </Typography>
        <Typography paragraph>{slides[activeIndex].description}</Typography>
        <Button component={Link} to={slides[activeIndex].action.path} variant="contained">
          {slides[activeIndex].action.label}
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}>
          {slides.map((slide, index) => (
            <Button
              key={slide.title}
              variant={index === activeIndex ? 'contained' : 'outlined'}
              color={index === activeIndex ? 'primary' : 'inherit'}
              onClick={() => setActiveIndex(index)}
              sx={{ borderColor: '#555', color: '#fff' }}
            >
              {slide.title}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
