import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import achievementApi from '../../services/achievementService';

const fallbackAchievements = [
  { id: 1, title: 'KHPL Champions', description: 'Anjigeri Naad won the Kodava Hockey Premier League championship, showcasing the strength of the nine-village team.' },
  { id: 2, title: 'Community Fitness Programs', description: 'Organized fitness and youth development programs across the Anjigeri Naad villages.' },
  { id: 3, title: 'Social Cohesion Initiatives', description: 'Led cleanliness and local environmental drives to unite the Kodava community.' }
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState(fallbackAchievements);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementApi.getAll()
      .then((data) => setAchievements(data))
      .catch(() => setAchievements(fallbackAchievements))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Achievements</Typography>
      <Typography paragraph>
        Anjigeri Naad Koota celebrates sporting success and grassroots community impact.
      </Typography>
      <Grid container spacing={3}>
        {achievements.map((achievement) => (
          <Grid item xs={12} md={6} key={achievement.id || achievement.title}>
            <Card sx={{ background: '#141414' }}>
              <CardContent>
                <Typography variant="h6">{achievement.title}</Typography>
                <Typography>{achievement.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography sx={{ mt: 2 }}>Loading achievements...</Typography>}
    </Box>
  );
}
