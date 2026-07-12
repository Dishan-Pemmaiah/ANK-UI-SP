import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import committeeApi from '../../services/committeeService';

const defaultCommitteeImage = '/ank-logo.jpeg';

export default function CommitteePage() {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    committeeApi.getAll()
      .then((data) => setCommittee(data))
      .catch(() => setCommittee([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Committee Members
      </Typography>
      <Grid container spacing={3}>
        {committee.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.name}>
            <Card sx={{ background: '#141414', height: '100%' }}>
              <Box
                component="img"
                src={member.photoUrl || defaultCommitteeImage}
                alt={member.name}
                sx={{ width: '100%', height: 240, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{member.name}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.5 }}>{member.role}</Typography>
                {member.description ? (
                  <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.72)' }}>{member.description}</Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography sx={{ mt: 2 }}>Loading committee data...</Typography>}
      {!loading && committee.length === 0 && <Typography sx={{ mt: 2 }}>No committee records found yet. Add one from the admin page.</Typography>}
    </Box>
  );
}
