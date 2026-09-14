import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Grid, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import HockeyMatchCard from '../../components/HockeyMatchCard';
import { getSeasonData } from '../../services/hockeyService';
import { getTournamentState, tournamentDayKey } from '../../services/tournamentState';

const tabs = ['Overview', 'Fixtures', 'Live', 'Results', 'Points Table', 'Teams', 'Knockouts', 'Stats'];
const slug = (tab) => tab.toLowerCase().replace(' ', '-');
const MatchList = ({ matches, basePath }) => matches.length ? <Stack spacing={1.5}>{matches.map((match) => <Box id={`match-${match.id}`} key={match.id}><HockeyMatchCard match={match} basePath={basePath} /></Box>)}</Stack> : <Typography sx={{ color: '#aaa' }}>No matches to show yet.</Typography>;

function Standings({ rows }) {
  if (!rows.length) return <Typography sx={{ color: '#aaa' }}>Teams will appear here when added.</Typography>;
  const pools = [...new Set(rows.map((row) => row.pool || 'League'))];
  return <>{pools.map((pool) => <Box key={pool} sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 1 }}> {pool === 'League' ? pool : `Pool ${pool}`}</Typography>
    <Box sx={{ overflowX: 'auto' }}><Box component="table" sx={{ width: '100%', minWidth: 510, borderCollapse: 'collapse', '& th, & td': { p: 1, textAlign: 'center', borderBottom: '1px solid #333' }, '& th:first-of-type, & td:first-of-type': { textAlign: 'left' } }}>
      <thead><tr>{['Team','P','W','D','L','GF','GA','GD','Pts'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{rows.filter((row) => (row.pool || 'League') === pool).sort((a,b) => b.points-a.points || b.goal_difference-a.goal_difference || b.goals_for-a.goals_for).map((row) => <tr key={row.team_id}><td>{row.team_name}</td>{[row.played,row.won,row.drawn,row.lost,row.goals_for,row.goals_against,row.goal_difference,row.points].map((value,index) => <td key={index}>{value}</td>)}</tr>)}</tbody>
    </Box></Box>
  </Box>)}</>;
}

export default function Anjk3Page() {
  const { slug: seasonSlug = 'anjk-3' } = useParams();
  const basePath = seasonSlug === 'anjk-3' ? '/anjk-3' : `/tournaments/${seasonSlug}`;
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [pool, setPool] = useState('');
  const [stage, setStage] = useState('');
  const tab = tabs.find((item) => slug(item) === params.get('tab')) || 'Overview';
  const load = useCallback(() => getSeasonData(seasonSlug).then(setData).catch((err) => setError(err.message)), [seasonSlug]);
  useEffect(() => { load(); const timer = setInterval(load, 12000); return () => clearInterval(timer); }, [load]);
  const state = useMemo(() => getTournamentState(data?.matches), [data]);
  const filtered = useMemo(() => (data?.matches || []).filter((match) => (!date || tournamentDayKey(new Date(match.scheduled_at)) === date) && (!pool || match.pool === pool) && (!stage || match.stage === stage)), [data, date, pool, stage]);
  const filteredByStatus = (statuses) => filtered.filter((match) => statuses.includes(match.status));
  const season = data?.season;
  return <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
    <Paper sx={{ p: { xs: 2.5, md: 4 }, mb: 3, borderRadius: 4, background: 'linear-gradient(130deg,#271010,#101010 60%,#14201b)' }}>
      <Typography variant="overline" sx={{ color: '#e0b08f', letterSpacing: 3 }}>ANJK Hockey Tournament</Typography>
      <Typography component="h1" variant="h3" sx={{ fontWeight: 900 }}>{season?.name || seasonSlug.toUpperCase().replace(/-/g, ' ')}</Typography>
      {season?.description && <Typography sx={{ mt: 1, color: '#ccc' }}>{season.description}</Typography>}
      {season?.venue && <Typography sx={{ mt: 1 }}>📍 {season.venue}</Typography>}
      {season?.poster_url && <Box component="img" src={season.poster_url} alt={`${season.name} poster`} sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', mt: 2, borderRadius: 2 }} />}
    </Paper>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Tabs value={tab} onChange={(_, value) => setParams({ tab: slug(value) })} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: '1px solid #333' }}>{tabs.map((item) => <Tab key={item} value={item} label={item} />)}</Tabs>
    {tab === 'Overview' && <Stack spacing={3}>
      {state.live && <Box><Typography variant="h5" sx={{ mb: 1, color: '#ff5555', fontWeight: 900 }}>● LIVE NOW</Typography><HockeyMatchCard match={state.live} basePath={basePath} /></Box>}
      {!state.live && state.next && <Box><Typography variant="h5" sx={{ mb: 1 }}>Next Match</Typography><HockeyMatchCard match={state.next} basePath={basePath} /></Box>}
      {data?.announcements?.length > 0 && <Box><Typography variant="h5" sx={{ mb: 1 }}>Announcements</Typography>{data.announcements.map((item) => <Paper key={item.id} sx={{ p: 2, mb: 1 }}><Typography fontWeight={800}>{item.title}</Typography><Typography>{item.body}</Typography></Paper>)}</Box>}
      {state.results.length > 0 && <Box><Typography variant="h5" sx={{ mb: 1 }}>Latest Results</Typography><MatchList matches={state.results.slice(0,3)} basePath={basePath} /></Box>}
    </Stack>}
    {['Fixtures','Results'].includes(tab) && <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} size="small" /><TextField select label="Pool" value={pool} onChange={(e) => setPool(e.target.value)} size="small" sx={{ minWidth: 120 }}><MenuItem value="">All pools</MenuItem>{[...new Set(data?.teams.map((team) => team.pool).filter(Boolean))].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField><TextField select label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} size="small" sx={{ minWidth: 150 }}><MenuItem value="">All stages</MenuItem>{['Group','League','Quarter Final','Semi Final','Final'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField><Button onClick={() => { setDate(''); setPool(''); setStage(''); }}>Clear</Button></Stack>
      {tab === 'Fixtures' && <Stack direction="row" spacing={1}><Chip label="Today" onClick={() => setDate(tournamentDayKey(new Date()))} /><Chip label="Upcoming" onClick={() => setDate('')} /></Stack>}
      <MatchList matches={filteredByStatus(tab === 'Fixtures' ? ['Upcoming','Live','Postponed','Cancelled'] : ['Completed'])} basePath={basePath} />
    </Stack>}
    {tab === 'Live' && <Stack spacing={2}><MatchList matches={filteredByStatus(['Live'])} basePath={basePath} />{data?.events.filter((event) => filteredByStatus(['Live']).some((match) => match.id === event.match_id)).slice(0,12).map((event) => <Paper key={event.id} sx={{ p: 1.5 }}><Typography fontWeight={800}>{event.event_type} {data.teams.find((team) => team.id === event.team_id)?.name || ''}</Typography><Typography variant="caption" color="text.secondary">{new Date(event.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</Typography></Paper>)}</Stack>}
    {tab === 'Points Table' && <Standings rows={data?.standings || []} />}
    {tab === 'Teams' && <Grid container spacing={2}>{data?.teams.map((team) => <Grid item xs={12} sm={6} md={4} key={team.id}><Paper sx={{ p: 2 }}><Typography variant="h6">{team.name}</Typography><Typography color="text.secondary">{team.pool ? `Pool ${team.pool}` : 'League'}</Typography><Typography variant="body2">{data.players.filter((player) => player.team_id === team.id).map((player) => player.name).join(', ')}</Typography></Paper></Grid>)}</Grid>}
    {tab === 'Knockouts' && <Box><Typography variant="h5" sx={{ mb: 2 }}>Knockout Bracket</Typography><Grid container spacing={2}>{['Quarter Final','Semi Final','Final'].map((round) => <Grid item xs={12} md={4} key={round}><Typography variant="h6" sx={{ mb: 1 }}>{round}</Typography><MatchList matches={(data?.matches || []).filter((match) => match.stage === round)} basePath={basePath} /></Grid>)}</Grid>{season?.champion_team_id && <Paper sx={{ p: 2, mt: 2 }}><Typography variant="h5">🏆 Champion: {data.teams.find((team) => team.id === season.champion_team_id)?.name}</Typography></Paper>}</Box>}
    {tab === 'Stats' && <Stack spacing={2}><Typography variant="h5">Tournament Stats</Typography><Typography>Matches played: {state.results.length} · Goals scored: {state.results.reduce((sum, match) => sum + match.home_score + match.away_score, 0)}</Typography><Standings rows={data?.standings || []} /></Stack>}
  </Box>;
}
