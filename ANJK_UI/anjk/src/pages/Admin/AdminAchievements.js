import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import achievementApi from '../../services/achievementService';

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementApi.getAll()
      .then((data) => setAchievements(data))
      .catch((error) => console.error('Failed to load achievements', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Achievements</Typography>
      {loading ? (
        <Typography>Loading achievements...</Typography>
      ) : (
        <Grid container spacing={3}>
          {achievements.map((achievement) => (
            <Grid item xs={12} md={6} key={achievement.id}>
              <Card sx={{ background: '#141414' }}>
                <CardContent>
                  <Typography variant="h6">{achievement.title}</Typography>
                  <Typography>{achievement.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
