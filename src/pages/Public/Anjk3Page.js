import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Grid, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';
import HockeyMatchCard from '../../components/HockeyMatchCard';
import { HockeyStandings, HockeyTeams } from './HockeyDirectory';
import { getSeasonData } from '../../services/hockeyService';
import { getTournamentState, tournamentDayKey } from '../../services/tournamentState';
import { getHockeyStats } from '../../services/hockeyStats';
import { formatSeasonDates } from '../../services/hockeyDates';
import { hockeyRefreshDelay } from '../../services/hockeyRefresh';
import AuthContext from '../../context/AuthContext';

const tabs = ['Overview', 'Fixtures', 'Live', 'Results', 'Points Table', 'Teams', 'Knockouts', 'Stats'];
const slug = (tab) => tab.toLowerCase().replace(' ', '-');
const MatchList = ({ matches, basePath, emptyMessage = 'No matches to show yet.' }) => matches.length ? <Stack spacing={1.5}>{matches.map((match) => <Box id={`match-${match.id}`} key={match.id}><HockeyMatchCard match={match} basePath={basePath} /></Box>)}</Stack> : <Typography sx={{ color: '#aaa' }}>{emptyMessage}</Typography>;

export default function Anjk3Page() {
  const auth = useContext(AuthContext);
  const { slug: seasonSlug = 'anjk-3' } = useParams();
  const basePath = seasonSlug === 'anjk-3' ? '/anjk-3' : `/tournaments/${seasonSlug}`;
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [dateInputKey, setDateInputKey] = useState(0);
  const dateInputRef = useRef(null);
  const [pool, setPool] = useState('');
  const [stage, setStage] = useState('');
  const tab = tabs.find((item) => slug(item) === params.get('tab')) || 'Overview';
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { try { const next = await getSeasonData(seasonSlug); setData(next); setError(''); return next; } catch (err) { setError(err.message); return null; } }, [seasonSlug]);
  useEffect(() => {
    let active = true; let timer;
    const tick = async () => {
      const next = await load();
      if (!active) return;
      timer = setTimeout(tick, hockeyRefreshDelay(next?.matches));
    };
    tick();
    return () => { active = false; clearTimeout(timer); };
  }, [load]);
  const state = useMemo(() => getTournamentState(data?.matches), [data]);
  const stats = useMemo(() => getHockeyStats(data?.matches, data?.events, data?.teams, data?.players), [data]);
  const filtered = useMemo(() => (data?.matches || []).filter((match) => (!date || tournamentDayKey(new Date(match.scheduled_at)) === date) && (!pool || match.pool === pool) && (!stage || match.stage === stage)), [data, date, pool, stage]);
  const filteredByStatus = (statuses) => filtered.filter((match) => statuses.includes(match.status));
  const openCalendar = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker();
    else { input.focus(); input.click(); }
  };
  const clearFilters = () => {
    if (dateInputRef.current) dateInputRef.current.value = '';
    setDate(''); setPool(''); setStage('');
    setDateInputKey((previous) => previous + 1);
  };
  const season = data?.season;
  const champion = data?.teams.find((team) => team.id === season?.champion_team_id);
  const seasonDates = formatSeasonDates(season?.starts_at, season?.ends_at);
  const liveEvents = (data?.events || []).filter((event) => ['Goal', 'Started', 'Phase Changed'].includes(event.event_type) && !event.is_voided && filteredByStatus(['Live']).some((match) => match.id === event.match_id));
  const controlPath = seasonSlug === 'anjk-3' ? '/admin/anjk-3' : `/admin/tournaments/${seasonSlug}`;
  return <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2.5, borderRadius: 4, background: 'linear-gradient(130deg,#271010,#101010 60%,#14201b)' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={season?.poster_url ? 8 : 12}>
          <Typography variant="overline" sx={{ color: '#e0b08f', letterSpacing: 2 }}>ANJK Hockey Tournament</Typography>
          <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' }, lineHeight: 1.12, overflowWrap: 'anywhere' }}>{season?.name || seasonSlug.toUpperCase().replace(/-/g, ' ')}</Typography>
          {season?.description && <Typography sx={{ mt: 1, color: '#ccc' }}>{season.description}</Typography>}
          {season?.venue && <Typography sx={{ mt: 1 }}>📍 {season.venue}</Typography>}
          {seasonDates && <Typography sx={{ mt: 1, fontWeight: 800 }}>📅 {seasonDates}</Typography>}
        </Grid>
        {season?.poster_url && <Grid item xs={12} md={4}><Box sx={{ textAlign: 'center', bgcolor: '#0c0c0c', borderRadius: 2, p: 1 }}><Box component="img" src={season.poster_url} alt={`${season.name} poster`} sx={{ display: 'block', width: 'auto', maxWidth: '100%', maxHeight: { xs: 250, sm: 300, md: 330 }, height: 'auto', objectFit: 'contain', mx: 'auto' }} /></Box></Grid>}
      </Grid>
    </Paper>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2, borderBottom: '1px solid #333', minWidth: 0 }}><Tabs value={tab} onChange={(_, value) => setParams({ tab: slug(value) })} variant="scrollable" scrollButtons="auto" sx={{ minWidth: 0, flex: 1 }}>{tabs.map((item) => <Tab key={item} value={item} label={item} />)}</Tabs><Button size="small" startIcon={<RefreshIcon />} disabled={refreshing} onClick={async () => { setRefreshing(true); await load(); setRefreshing(false); }} aria-label="Refresh tournament" sx={{ flexShrink: 0 }}>{refreshing ? 'Updating' : 'Refresh'}</Button></Stack>
    {tab === 'Overview' && <Stack spacing={3}>
      {state.live && <Box><Button component={Link} to={`${basePath}?tab=live#match-${state.live.id}`} sx={{ mb: 1, color: '#ff5555', fontWeight: 900, fontSize: '1.4rem', px: 0 }}>● LIVE NOW</Button><HockeyMatchCard match={state.live} basePath={basePath} />{auth?.isAdmin && <Button component={Link} to={`${controlPath}?tab=match-control&match=${state.live.id}`} sx={{ mt: 1 }}>Control live match in CMS</Button>}</Box>}
      {!state.live && state.next && <Box><Typography variant="h5" sx={{ mb: 1 }}>Next Match</Typography><HockeyMatchCard match={state.next} basePath={basePath} /></Box>}
      {data?.announcements?.some((item) => item.is_published) && <Box><Typography variant="h5" sx={{ mb: 1 }}>Announcements</Typography>{data.announcements.filter((item) => item.is_published).map((item) => <Paper key={item.id} sx={{ p: 2, mb: 1 }}><Typography fontWeight={800}>{item.title}</Typography><Typography>{item.body}</Typography></Paper>)}</Box>}
      {state.results.length > 0 && <Box><Typography variant="h5" sx={{ mb: 1 }}>Latest Results</Typography><MatchList matches={state.results.slice(0,3)} basePath={basePath} /></Box>}
    </Stack>}
    {['Fixtures','Results'].includes(tab) && <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <TextField key={dateInputKey} type="date" label="Match date" InputLabelProps={{ shrink: true }} inputRef={dateInputRef} value={date} onChange={(e) => setDate(e.target.value)} size="small" sx={{ minWidth: { sm: 195 }, '& input': { colorScheme: 'dark' }, '& input::-webkit-calendar-picker-indicator': { filter: 'brightness(0) invert(1)', opacity: 1, cursor: 'pointer' } }} />
        <Button variant="outlined" color="inherit" startIcon={<CalendarMonthIcon />} onClick={openCalendar} aria-label="Open calendar" sx={{ minHeight: 40, whiteSpace: 'nowrap' }}>Calendar</Button>
        <TextField select label="Pool" value={pool} onChange={(e) => setPool(e.target.value)} size="small" sx={{ minWidth: 120 }}><MenuItem value="">All pools</MenuItem>{[...new Set(data?.teams.map((team) => team.pool).filter(Boolean))].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} size="small" sx={{ minWidth: 150 }}><MenuItem value="">All stages</MenuItem>{['Group','League','Quarter Final','Semi Final','Final'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <Button variant="text" color="inherit" onClick={clearFilters} sx={{ minHeight: 40, whiteSpace: 'nowrap' }}>Clear filters</Button>
      </Stack>
      <Typography variant="caption" aria-live="polite" sx={{ color: '#aaa' }}>{date || pool || stage ? `Filters: ${[date || 'All dates', pool ? `Pool ${pool}` : 'All pools', stage || 'All stages'].join(' · ')}` : 'Showing all dates, pools and stages'}</Typography>
      {tab === 'Fixtures' && <Stack direction="row" spacing={1}><Chip label="Today" onClick={() => setDate(tournamentDayKey(new Date()))} /><Chip label="Upcoming" onClick={() => setDate('')} /></Stack>}
      <MatchList matches={filteredByStatus(tab === 'Fixtures' ? ['Upcoming','Live','Postponed','Cancelled'] : ['Completed'])} basePath={basePath} emptyMessage={date || pool || stage ? 'No matches match these filters.' : 'No matches to show yet.'} />
    </Stack>}
    {tab === 'Live' && <Stack spacing={2}><MatchList matches={filteredByStatus(['Live'])} basePath={basePath} />{auth?.isAdmin && filteredByStatus(['Live']).map((match) => <Button key={match.id} component={Link} to={`${controlPath}?tab=match-control&match=${match.id}`} variant="outlined">Control {match.home?.name} vs {match.away?.name} in CMS</Button>)}{liveEvents.slice(0,12).map((event) => <Paper key={event.id} sx={{ p: 1.5 }}><Typography fontWeight={800}>{event.event_type} {data.teams.find((team) => team.id === event.team_id)?.name || ''}{event.player_id ? ` · ${data.players.find((player) => player.id === event.player_id)?.name || ''}` : ''}{event.event_type === 'Phase Changed' ? ` · ${event.note}` : ''}</Typography><Typography variant="caption" color="text.secondary">{new Date(event.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</Typography></Paper>)}</Stack>}
    {tab === 'Points Table' && <HockeyStandings rows={data?.standings || []} />}
    {tab === 'Teams' && <HockeyTeams teams={data?.teams || []} players={data?.players || []} />}
    {tab === 'Knockouts' && <Box><Typography variant="h5" sx={{ mb: 2 }}>Knockout Bracket</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2, alignItems: 'stretch' }}>{['Quarter Final','Semi Final','Final','Champion'].map((round, index) => <Box key={round} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, '&::after': index < 3 ? { content: '"→"', position: 'absolute', right: -17, top: '50%', color: '#dcb99b', fontSize: 24, zIndex: 1, display: { xs: 'none', md: 'block' } } : {} }}><Typography variant="h6" sx={{ mb: 1, color: '#dcb99b' }}>{round}</Typography>{round === 'Champion' ? <Paper sx={{ p: 2, border: '1px solid #9d7144', textAlign: 'center' }}><Typography variant="h4">🏆</Typography><Typography fontWeight={900}>{champion?.name || 'To be confirmed'}</Typography></Paper> : <Stack spacing={1.5}>{(data?.matches || []).filter((match) => match.stage === round).length ? (data?.matches || []).filter((match) => match.stage === round).map((match) => <HockeyMatchCard key={match.id} match={match} compact basePath={basePath} />) : <Paper sx={{ p: 2, color: '#aaa' }}>To be decided</Paper>}</Stack>}{index < 3 && <Typography sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', color: '#dcb99b', fontSize: 24 }}>↓</Typography>}</Box>)}</Box></Box>}
    {tab === 'Stats' && <Stack spacing={2}><Typography variant="h5">Tournament Stats</Typography>{stats.matchesPlayed > 0 && <Grid container spacing={2}><Grid item xs={6} sm={4}><Paper sx={{ p: 2 }}><Typography color="text.secondary">Matches Played</Typography><Typography variant="h4" fontWeight={900}>{stats.matchesPlayed}</Typography></Paper></Grid><Grid item xs={6} sm={4}><Paper sx={{ p: 2 }}><Typography color="text.secondary">Total Goals</Typography><Typography variant="h4" fontWeight={900}>{stats.totalGoals}</Typography></Paper></Grid></Grid>}{stats.topScorers.length > 0 && <Paper sx={{ p: 2 }}><Typography variant="h6">Top Scorers</Typography>{stats.topScorers.slice(0, 10).map(({ player, goals }) => <Stack key={player.id} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}><Typography>{player.name} · {data.teams.find((team) => team.id === player.team_id)?.name}</Typography><Typography fontWeight={800}>{goals}</Typography></Stack>)}</Paper>}{stats.teamGoals.length > 0 && <Paper sx={{ p: 2 }}><Typography variant="h6">Team Goals</Typography>{stats.teamGoals.map(({ team, goals }) => <Stack key={team.id} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}><Typography>{team.name}</Typography><Typography fontWeight={800}>{goals}</Typography></Stack>)}</Paper>}{stats.mostWins.length > 0 && <Paper sx={{ p: 2 }}><Typography variant="h6">Most Wins</Typography>{stats.mostWins.map(({ team, wins }) => <Stack key={team.id} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}><Typography>{team.name}</Typography><Typography fontWeight={800}>{wins}</Typography></Stack>)}</Paper>}{stats.matchesPlayed === 0 && <Typography sx={{ color: '#aaa' }}>Stats will appear after the first completed match.</Typography>}</Stack>}
  </Box>;
}
