import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import achievementApi from '../../services/achievementService';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementApi.getAll()
      .then((data) => setAchievements(data))
      .catch(() => setAchievements([]))
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
      {loading && <Typography sx={{ mt: 2 }}>Loading achievements from the database...</Typography>}
      {!loading && achievements.length === 0 && <Typography sx={{ mt: 2 }}>No achievements found in the database.</Typography>}
    </Box>
  );
}
