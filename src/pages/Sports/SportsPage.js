import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import sportsApi from '../../services/sportsService';

const SPORT_OPTIONS = ['All', 'Cricket', 'Football', 'Hockey', 'Kho-Kho', 'Kabaddi', 'Marathon', 'Other'];

const STATUS_OPTIONS = ['All', 'Upcoming', 'Live', 'Completed'];

const SECTION_LINKS = [
  { key: 'overview', label: 'Overview', path: '/sports' },
  { key: 'hosted', label: 'Hosted', path: '/sports/hosted' },
  { key: 'external', label: 'Playing Other', path: '/sports/external' },
  { key: 'live', label: 'Live', path: '/sports/live' },
  { key: 'fixtures', label: 'Fixtures', path: '/sports/fixtures' },
  { key: 'history', label: 'History', path: '/sports/history' }
];

const normalizeStatus = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (text === 'live') return 'Live';
  if (text === 'completed') return 'Completed';
  if (text === 'upcoming') return 'Upcoming';
  return 'Upcoming';
};

const detectSport = (item) => {
  if (item?.sportName) {
    return String(item.sportName).trim() || 'Other';
  }

  const text = [
    item?.sport,
    item?.sportType,
    item?.category,
    item?.tournamentName,
    item?.description,
    item?.currentTournament,
    item?.teamDetails
  ].join(' ').toLowerCase();

  if (text.includes('cricket')) return 'Cricket';
  if (text.includes('football')) return 'Football';
  if (text.includes('hockey')) return 'Hockey';
  if (/kho\s*-?\s*kho|koko/.test(text)) return 'Kho-Kho';
  if (/kabaddi|kabadi/.test(text)) return 'Kabaddi';
  if (text.includes('marathon')) return 'Marathon';
  return 'Other';
};

const toComparableNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const sortTournamentRows = (rows) => {
  return [...rows].sort((a, b) => {
    const orderDiff = toComparableNumber(a.sortOrder) - toComparableNumber(b.sortOrder);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    const yearDiff = toComparableNumber(b.year) - toComparableNumber(a.year);
    if (yearDiff !== 0) {
      return yearDiff;
    }
    return String(a.tournamentName || '').localeCompare(String(b.tournamentName || ''));
  });
};

const parseLines = (value) => String(value || '')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const parsePointsRows = (item) => {
  if (Array.isArray(item?.pointsTableRows) && item.pointsTableRows.length) {
    return item.pointsTableRows.map((row) => ({
      team: row?.team || '-',
      p: row?.played || '-',
      w: row?.won || '-',
      l: row?.lost || '-',
      pts: row?.points || '-',
      nrr: row?.nrr || '-'
    }));
  }

  return parseLines(item?.pointsTable)
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2)
    .map((cells) => ({
      team: cells[0] || '-',
      p: cells[1] || '-',
      w: cells[2] || '-',
      l: cells[3] || '-',
      pts: cells[4] || '-',
      nrr: cells[5] || '-'
    }));
};

const toSafeHttpUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  return `https://${text}`;
};

const getSectionKey = (pathname) => {
  if (pathname.endsWith('/hosted')) return 'hosted';
  if (pathname.endsWith('/external')) return 'external';
  if (pathname.endsWith('/live')) return 'live';
  if (pathname.endsWith('/fixtures')) return 'fixtures';
  if (pathname.endsWith('/history')) return 'history';
  return 'overview';
};

export default function SportsPage() {
  const location = useLocation();
  const [tournaments, setTournaments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const section = getSectionKey(location.pathname);

  useEffect(() => {
    sportsApi.getTournaments()
      .then((records) => {
        setTournaments(records || []);
      })
      .catch(() => {
        setTournaments([]);
      });
  }, []);

  const normalizedRows = useMemo(() => {
    return sortTournamentRows((tournaments || []).map((item) => ({
      ...item,
      sportName: detectSport(item),
      normalizedStatus: normalizeStatus(item.status)
    })));
  }, [tournaments]);

  const years = useMemo(() => {
    const distinct = new Set(normalizedRows.map((item) => String(item.year || '')).filter(Boolean));
    return ['All', ...Array.from(distinct).sort((a, b) => Number(b) - Number(a))];
  }, [normalizedRows]);

  const availableSports = useMemo(() => {
    const cmsSports = Array.from(new Set(normalizedRows.map((row) => row.sportName).filter(Boolean)));
    const orderedKnown = SPORT_OPTIONS.filter((sport) => sport !== 'All' && cmsSports.includes(sport));
    const extras = cmsSports.filter((sport) => !orderedKnown.includes(sport)).sort((a, b) => a.localeCompare(b));
    return ['All', ...orderedKnown, ...extras];
  }, [normalizedRows]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return normalizedRows.filter((item) => {
      const matchesYear = selectedYear === 'All' || String(item.year) === selectedYear;
      const matchesStatus = selectedStatus === 'All' || item.normalizedStatus === selectedStatus;
      const matchesSport = selectedSport === 'All' || item.sportName === selectedSport;

      if (!matchesYear || !matchesStatus || !matchesSport) {
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
        item.fixtureLabel,
        item.teamA,
        item.teamB,
        item.playing11,
        item.matchSchedule,
        item.teamDetails,
        item.sportName
      ].join(' ').toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [normalizedRows, normalizedSearch, selectedYear, selectedStatus, selectedSport]);

  const liveTournaments = filtered.filter((item) => item.normalizedStatus === 'Live' || String(item.tournamentType || '').toLowerCase() === 'live');
  const fixtureRows = filtered.filter((item) => item.normalizedStatus === 'Upcoming' || item.normalizedStatus === 'Live');
  const historyRows = filtered.filter((item) => item.normalizedStatus === 'Completed');
  const hostedRows = filtered.filter((item) => {
    const type = String(item.tournamentType || '').toLowerCase();
    return type === 'hosted' || type === 'fixture';
  });
  const externalRows = filtered.filter((item) => String(item.tournamentType || '').toLowerCase() === 'external');

  const statsBySport = useMemo(() => {
    const sportsFromCms = Array.from(new Set(filtered.map((item) => item.sportName).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    const entries = sportsFromCms.map((sport) => ({
      sport,
      total: 0,
      live: 0,
      upcoming: 0,
      completed: 0
    }));
    const map = new Map(entries.map((entry) => [entry.sport, entry]));

    filtered.forEach((item) => {
      const key = item.sportName;
      const bucket = map.get(key);
      if (!bucket) {
        return;
      }

      bucket.total += 1;
      if (item.normalizedStatus === 'Live') bucket.live += 1;
      if (item.normalizedStatus === 'Upcoming') bucket.upcoming += 1;
      if (item.normalizedStatus === 'Completed') bucket.completed += 1;
    });

    return entries;
  }, [filtered]);

  const archiveByYear = historyRows.reduce((acc, item) => {
    const year = item.year || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {});

  const archiveYears = Object.keys(archiveByYear).sort((a, b) => Number(b) - Number(a));

  const hostedDeskRows = hostedRows;

  const renderTournamentCard = (item) => (
    <Card key={item.id} sx={{ background: '#141414', height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={item.sportName || 'Sport'} color="secondary" />
          <Chip size="small" label={item.tournamentType || 'Tournament'} />
          <Chip
            size="small"
            label={item.normalizedStatus || 'Upcoming'}
            color={item.normalizedStatus === 'Live' ? 'error' : 'default'}
          />
          <Chip size="small" label={item.year || 'N/A'} variant="outlined" />
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{item.tournamentName}</Typography>
        {item.hostedBy ? <Typography sx={{ opacity: 0.8 }}>Hosted by: {item.hostedBy}</Typography> : null}
        {item.venue ? <Typography sx={{ opacity: 0.8 }}>Venue: {item.venue}</Typography> : null}
        {item.result ? <Typography sx={{ mt: 1 }}>Result: {item.result}</Typography> : null}
        {item.description ? <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>{item.description}</Typography> : null}
        {item.currentTournament ? <Typography sx={{ mt: 1 }}>Current Tournament: {item.currentTournament}</Typography> : null}
        {item.fixtureLabel ? <Typography sx={{ mt: 1 }}>Fixture: {item.fixtureLabel}</Typography> : null}
        {item.teamA || item.teamB ? <Typography sx={{ mt: 1 }}>Match: {item.teamA || 'Team A'} vs {item.teamB || 'Team B'}</Typography> : null}
        {item.matchSchedule ? <Typography sx={{ mt: 1 }}>Match Schedule: {item.matchSchedule}</Typography> : null}
        {item.teamDetails ? <Typography sx={{ mt: 1 }}>Team Details: {item.teamDetails}</Typography> : null}
        {(Array.isArray(item.players) && item.players.length) ? (
          <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>Playing Squad: {item.players.join(', ')}</Typography>
        ) : item.playing11 ? <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>Playing Squad: {item.playing11}</Typography> : null}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
          {String(item.tournamentType || '').toLowerCase() === 'hosted' && item.registrationLink ? (
            <Button
              component="a"
              href={toSafeHttpUrl(item.registrationLink)}
              target="_blank"
              rel="noreferrer"
              variant="contained"
              size="small"
            >
              Register
            </Button>
          ) : null}
          {item.liveLink ? (
            <Button
              component="a"
              href={toSafeHttpUrl(item.liveLink)}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              color="inherit"
              size="small"
            >
              Watch Live
            </Button>
          ) : null}
        </Stack>

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
      <Typography variant="h4" gutterBottom>Sports Center</Typography>
      <Typography sx={{ mb: 2, opacity: 0.85 }}>
        Track sports updates with a public view inspired by score apps: live cards, fixtures table, history archive, and sport-wise stats.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Search tournaments" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField select fullWidth label="Sport" value={selectedSport} onChange={(event) => setSelectedSport(event.target.value)}>
            {availableSports.map((sport) => <MenuItem key={sport} value={sport}>{sport}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField select fullWidth label="Year" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
            {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField select fullWidth label="Status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
            {STATUS_OPTIONS.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1.2, background: '#131313', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2.5, mb: 3 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {SECTION_LINKS.map((item) => (
            <Button
              key={item.key}
              component={Link}
              to={item.path}
              variant={section === item.key ? 'contained' : 'outlined'}
              color={section === item.key ? 'primary' : 'inherit'}
              size="small"
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

      {section === 'overview' ? (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statsBySport.length ? statsBySport.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row.sport}>
              <Card sx={{ background: '#141414', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{row.sport}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
                    <Chip size="small" label={`Total ${row.total}`} />
                    <Chip size="small" color="error" label={`Live ${row.live}`} />
                    <Chip size="small" color="warning" label={`Upcoming ${row.upcoming}`} />
                    <Chip size="small" color="success" label={`Completed ${row.completed}`} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )) : <Grid item xs={12}><Typography>No CMS sports records available yet. Add records from Admin Sports.</Typography></Grid>}
        </Grid>
      ) : null}

      {section === 'live' ? (
        <>
          <Typography variant="h5" gutterBottom>Live Matches & Updates</Typography>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {liveTournaments.length ? liveTournaments.map((item) => <Grid item xs={12} md={6} key={item.id}>{renderTournamentCard(item)}</Grid>) : <Grid item xs={12}><Typography>No live tournaments available right now.</Typography></Grid>}
          </Grid>
        </>
      ) : null}

      {section === 'history' ? (
        <>
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
        </>
      ) : null}

      {section === 'external' ? (
        <>
          <Typography variant="h5" gutterBottom>Playing Other Tournaments</Typography>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {externalRows.length ? externalRows.map((item) => <Grid item xs={12} md={6} key={item.id}>{renderTournamentCard(item)}</Grid>) : <Grid item xs={12}><Typography>No external tournament records found.</Typography></Grid>}
          </Grid>
        </>
      ) : null}

      {section === 'hosted' ? (
        <>
          <Typography variant="h5" gutterBottom>Hosted Tournament Desk</Typography>
          {hostedDeskRows.length ? (
            <Grid container spacing={2.5}>
              {hostedDeskRows.map((item) => {
                const fixtureLines = parseLines(item.hostedFixtures);
                const squadLines = (Array.isArray(item.players) && item.players.length) ? item.players : parseLines(item.playing11);
                const statLines = parseLines(item.otherStats);
                const pointsRows = parsePointsRows(item);

                return (
                  <Grid item xs={12} key={`desk-${item.id}`}>
                    <Paper sx={{ p: 2.25, background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{item.tournamentName}</Typography>
                          <Typography sx={{ opacity: 0.78 }}>{item.sportName} • {item.year} • {item.venue || 'Venue TBA'}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip size="small" label={item.normalizedStatus} color={item.normalizedStatus === 'Live' ? 'error' : 'default'} />
                          {item.registrationLink ? <Button component="a" href={toSafeHttpUrl(item.registrationLink)} target="_blank" rel="noreferrer" variant="contained" size="small">Register</Button> : null}
                          {item.liveLink ? <Button component="a" href={toSafeHttpUrl(item.liveLink)} target="_blank" rel="noreferrer" variant="outlined" color="inherit" size="small">Watch Live</Button> : null}
                        </Stack>
                      </Stack>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#d9b18f' }}>Hosted Fixtures</Typography>
                          {fixtureLines.length ? (
                            <Stack spacing={0.8}>
                              {fixtureLines.map((line, index) => (
                                <Typography key={`${item.id}-fixture-${index}`} sx={{ opacity: 0.84 }}>• {line}</Typography>
                              ))}
                            </Stack>
                          ) : <Typography sx={{ opacity: 0.65 }}>No fixture lines configured.</Typography>}
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#d9b18f' }}>Playing Squad</Typography>
                          {squadLines.length ? (
                            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                              {squadLines.map((line, index) => (
                                <Chip key={`${item.id}-squad-${index}`} size="small" label={line} variant="outlined" />
                              ))}
                            </Stack>
                          ) : <Typography sx={{ opacity: 0.65 }}>No playing squad configured.</Typography>}
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#d9b18f' }}>Points Table</Typography>
                          {pointsRows.length ? (
                            <TableContainer component={Paper} sx={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Team</TableCell>
                                    <TableCell>P</TableCell>
                                    <TableCell>W</TableCell>
                                    <TableCell>L</TableCell>
                                    <TableCell>Pts</TableCell>
                                    <TableCell>NRR</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {pointsRows.map((row, index) => (
                                    <TableRow key={`${item.id}-pt-${index}`}>
                                      <TableCell>{row.team}</TableCell>
                                      <TableCell>{row.p}</TableCell>
                                      <TableCell>{row.w}</TableCell>
                                      <TableCell>{row.l}</TableCell>
                                      <TableCell>{row.pts}</TableCell>
                                      <TableCell>{row.nrr}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : <Typography sx={{ opacity: 0.65 }}>No points table configured.</Typography>}
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#d9b18f' }}>Other Stats</Typography>
                          {statLines.length ? (
                            <Stack spacing={0.7}>
                              {statLines.map((line, index) => (
                                <Typography key={`${item.id}-stat-${index}`} sx={{ opacity: 0.84 }}>• {line}</Typography>
                              ))}
                            </Stack>
                          ) : <Typography sx={{ opacity: 0.65 }}>No additional stats configured.</Typography>}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>No hosted/fixture tournaments found for current filters.</Typography>
          )}
        </>
      ) : null}

      {section === 'fixtures' ? (
        <>
          <Typography variant="h5" gutterBottom>Fixtures Table</Typography>
          <Typography sx={{ mb: 1.5, opacity: 0.75 }}>
            Upcoming and live fixtures across football, cricket, hockey, kho-kho, kabaddi, and marathon.
          </Typography>
          <TableContainer component={Paper} sx={{ background: '#141414', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sport</TableCell>
                  <TableCell>Tournament</TableCell>
                  <TableCell>Fixture</TableCell>
                  <TableCell>Match</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Links</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fixtureRows.length ? fixtureRows.map((item) => (
                  <TableRow key={`fixture-${item.id}`}>
                    <TableCell>{item.sportName}</TableCell>
                    <TableCell>{item.tournamentName || '-'}</TableCell>
                    <TableCell>{item.fixtureLabel || item.matchSchedule || item.currentTournament || '-'}</TableCell>
                    <TableCell>{item.teamA || item.teamB ? `${item.teamA || 'Team A'} vs ${item.teamB || 'Team B'}` : '-'}</TableCell>
                    <TableCell>{item.venue || '-'}</TableCell>
                    <TableCell>{item.normalizedStatus}</TableCell>
                    <TableCell>{item.result || '-'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {String(item.tournamentType || '').toLowerCase() === 'hosted' && item.registrationLink ? (
                          <Button
                            component="a"
                            href={toSafeHttpUrl(item.registrationLink)}
                            target="_blank"
                            rel="noreferrer"
                            variant="contained"
                            size="small"
                          >
                            Register
                          </Button>
                        ) : null}
                        {item.liveLink ? (
                          <Button
                            component="a"
                            href={toSafeHttpUrl(item.liveLink)}
                            target="_blank"
                            rel="noreferrer"
                            variant="outlined"
                            color="inherit"
                            size="small"
                          >
                            Live
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8}>No fixture records found for the selected filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </Box>
  );
}
