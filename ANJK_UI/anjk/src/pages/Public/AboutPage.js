import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import aboutApi from '../../services/aboutService';

export default function AboutPage() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    aboutApi.getAll()
      .then((data) => setSections(data))
      .catch(() => setSections([]));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        About Anjigeri Naad Koota
      </Typography>
      {sections.map((section) => (
        <Paper key={section.id} sx={{ p: 3, mb: 2, background: '#141414' }}>
          <Typography variant="h6" gutterBottom>{section.title}</Typography>
          <Typography paragraph sx={{ mb: 0 }}>{section.body}</Typography>
        </Paper>
      ))}
      {sections.length === 0 && (
        <Typography sx={{ opacity: 0.8 }}>No about content found in the database.</Typography>
      )}
    </Box>
  );
}
