import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import villageApi from '../services/villageService';

const fallbackVillages = [
  'Hudikeri',
  'Konageri',
  'Hysudloor (Hysudluru)',
  'Begur (Begoor)',
  'Mugutageri (Mugatageri)',
  'Nadikeri',
  'Thuchamakeri (Thuchumkeri)',
  'Chikkamundur (Chikkamandur)',
  'Baliamandur (Ballyamandur)'
];

export default function AboutDetailsPage() {
  const [villages, setVillages] = useState(fallbackVillages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    villageApi.getAll()
      .then((data) => setVillages(data.map((item) => item.name || item)))
      .catch(() => setVillages(fallbackVillages))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>About ANK</Typography>
      <Typography paragraph>
        Anjigeri Naad Koota celebrates the Kodava heritage of the Anjigeri region, where a "Naad" historically described a community territory
        inhabited by interlinked Kodava okkas (families).
      </Typography>
      <Typography variant="h6" gutterBottom>The Nine Villages</Typography>
      <List>
        {villages.map((village) => (
          <ListItem key={village} disablePadding>
            <ListItemText primary={village} />
          </ListItem>
        ))}
      </List>
      <Typography paragraph>
        In contemporary use, the Anjigeri Naad name is strongly connected to sports — especially the Kodava Hockey Premier League (KHPL).
        The club brings together athletes and sports enthusiasts from these nine villages to compete, train, and promote fitness.
      </Typography>
      <Typography paragraph>
        Beyond hockey, Anjigeri Naad supports community engagement through fitness awareness programs, environmental campaigns,
        youth development, and local events that strengthen social cohesion across the Kodava community.
      </Typography>
      <Typography paragraph>
        Our club identity helps residents maintain physical fitness, celebrate Kodava culture, and nurture a collective spirit rooted in regional pride.
      </Typography>
      {loading && <Typography sx={{ mt: 2 }}>Loading village details...</Typography>}
    </Box>
  );
}
