import { useMemo, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import sportsApi from '../../services/sportsService';

export default function SportsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    sportsApi.getTournaments()
      .then((records) => {
        setTournaments(records || []);
      })
      .catch(() => {
        setTournaments([]);
      });
  }, []);

  const years = useMemo(() => {
    const distinct = new Set(tournaments.map((item) => String(item.year || '')).filter(Boolean));
    return ['All', ...Array.from(distinct).sort((a, b) => Number(b) - Number(a))];
  }, [tournaments]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesYear = selectedYear === 'All' || String(item.year) === selectedYear;
      const matchesStatus = selectedStatus === 'All' || String(item.status || '').toLowerCase() === selectedStatus.toLowerCase();

      if (!matchesYear || !matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        item.tournamentName,
        item.venue,
        item.description,
        item.result,
        item.hostedBy,
        item.currentTournament,
        item.matchSchedule,
        item.teamDetails
      ].join(' ').toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [tournaments, normalizedSearch, selectedYear, selectedStatus]);

  const hostedTournaments = filtered.filter((item) => item.tournamentType === 'Hosted');
  const externalTournaments = filtered.filter((item) => item.tournamentType === 'External');
  const liveTournaments = filtered.filter((item) => item.tournamentType === 'Live');

  const archiveByYear = filtered.reduce((acc, item) => {
    const year = item.year || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {});

  const archiveYears = Object.keys(archiveByYear).sort((a, b) => Number(b) - Number(a));

  const renderTournamentCard = (item) => (
    <Card key={item.id} sx={{ background: '#141414', height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={item.tournamentType || 'Tournament'} />
          <Chip
            size="small"
            label={item.status || 'Upcoming'}
            color={String(item.status || '').toLowerCase() === 'live' ? 'error' : 'default'}
          />
          <Chip size="small" label={item.year || 'N/A'} variant="outlined" />
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{item.tournamentName}</Typography>
        {item.hostedBy ? <Typography sx={{ opacity: 0.8 }}>Hosted by: {item.hostedBy}</Typography> : null}
        {item.venue ? <Typography sx={{ opacity: 0.8 }}>Venue: {item.venue}</Typography> : null}
        {item.result ? <Typography sx={{ mt: 1 }}>Result: {item.result}</Typography> : null}
        {item.description ? <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>{item.description}</Typography> : null}
        {item.currentTournament ? <Typography sx={{ mt: 1 }}>Current Tournament: {item.currentTournament}</Typography> : null}
        {item.matchSchedule ? <Typography sx={{ mt: 1 }}>Match Schedule: {item.matchSchedule}</Typography> : null}
        {item.teamDetails ? <Typography sx={{ mt: 1 }}>Team Details: {item.teamDetails}</Typography> : null}

        {Array.isArray(item.images) && item.images.length > 0 ? (
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            {item.images.slice(0, 3).map((image, index) => (
              <Grid item xs={4} key={`${item.id}-img-${index}`}>
                <Box component="img" src={image} alt={`${item.tournamentName} ${index + 1}`} sx={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        ) : null}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sports Management</Typography>
      <Typography sx={{ mb: 2, opacity: 0.85 }}>
        Explore hosted tournaments, external tournaments, live tournament updates, and year-wise history.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Search tournaments" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth label="Year" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
            {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth label="Status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
            <MenuItem value="Live">Live</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

      <Typography variant="h5" gutterBottom>Hosted Tournaments</Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {hostedTournaments.length ? hostedTournaments.map((item) => <Grid item xs={12} md={6} key={item.id}>{renderTournamentCard(item)}</Grid>) : <Grid item xs={12}><Typography>No hosted tournaments found.</Typography></Grid>}
      </Grid>

      <Typography variant="h5" gutterBottom>External Tournaments Participated</Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {externalTournaments.length ? externalTournaments.map((item) => <Grid item xs={12} md={6} key={item.id}>{renderTournamentCard(item)}</Grid>) : <Grid item xs={12}><Typography>No external tournaments found.</Typography></Grid>}
      </Grid>

      <Typography variant="h5" gutterBottom>Live Tournaments</Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {liveTournaments.length ? liveTournaments.map((item) => <Grid item xs={12} md={6} key={item.id}>{renderTournamentCard(item)}</Grid>) : <Grid item xs={12}><Typography>No live tournaments available right now.</Typography></Grid>}
      </Grid>

      <Typography variant="h5" gutterBottom>History Archive</Typography>
      {archiveYears.length ? archiveYears.map((year) => (
        <Accordion key={year} defaultExpanded={year === archiveYears[0]} sx={{ background: '#141414', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography sx={{ fontWeight: 800 }}>{year}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {archiveByYear[year].map((item) => (
                <Grid item xs={12} md={6} key={item.id}>{renderTournamentCard(item)}</Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )) : <Typography>No historical records found.</Typography>}
    </Box>
  );
}
