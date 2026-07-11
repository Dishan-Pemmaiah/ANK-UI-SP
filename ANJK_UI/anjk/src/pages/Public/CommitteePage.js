import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import committeeApi from '../../services/committeeService';

const fallbackCommittee = [
  { name: 'Rahul Kumar', role: 'President' },
  { name: 'Meera Patil', role: 'Secretary' },
  { name: 'Suresh Babu', role: 'Treasurer' }
];

export default function CommitteePage() {
  const [committee, setCommittee] = useState(fallbackCommittee);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    committeeApi.getAll()
      .then((data) => setCommittee(data))
      .catch(() => setCommittee(fallbackCommittee))
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
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">{member.name}</Typography>
              <Typography>{member.role}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography sx={{ mt: 2 }}>Loading committee data...</Typography>}
    </Box>
  );
}
