import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import villageApi from '../services/villageService';
import aboutApi from '../../services/aboutService';

export default function AboutDetailsPage() {
  const [villages, setVillages] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([villageApi.getAll(), aboutApi.getAll()])
      .then(([villageData, aboutData]) => {
        setVillages(villageData.map((item) => item.name || item));
        setSections(aboutData);
      })
      .catch(() => {
        setVillages([]);
        setSections([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>About ANK</Typography>
      {sections.map((section) => (
        <Paper key={section.id} sx={{ p: 3, mb: 2, background: '#141414' }}>
          <Typography variant="h6" gutterBottom>{section.title}</Typography>
          <Typography paragraph sx={{ mb: 0 }}>{section.body}</Typography>
        </Paper>
      ))}
      <Typography variant="h6" gutterBottom>The Nine Villages</Typography>
      <List>
        {villages.map((village) => (
          <ListItem key={village} disablePadding>
            <ListItemText primary={village} />
          </ListItem>
        ))}
      </List>
      {loading && <Typography sx={{ mt: 2 }}>Loading village details from the database...</Typography>}
      {!loading && villages.length === 0 && <Typography sx={{ mt: 2 }}>No village records found in the database.</Typography>}
    </Box>
  );
}
