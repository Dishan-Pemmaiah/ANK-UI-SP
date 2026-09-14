import { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import HockeyMatchCard from './HockeyMatchCard';
import { getSeasonData } from '../services/hockeyService';
import { getTournamentState } from '../services/tournamentState';

export default function HomeTournament() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    const load = () => getSeasonData().then((value) => { if (active) setData(value); }).catch(() => {});
    load(); const timer = setInterval(load, 12000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const season = data?.season;
  if (!season || (!data.matches.length && !season.poster_url && !season.starts_at)) return null;
  const state = getTournamentState(data.matches);
  const main = state.live || (state.dayFinished ? state.results[0] : state.next) || state.results[0];
  const days = season.starts_at ? Math.max(0, Math.ceil((new Date(season.starts_at).getTime() - Date.now()) / 86400000)) : null;
  const sections = [
    { title: 'Today’s Matches', matches: state.today.filter((match) => match.id !== main?.id && ['Upcoming','Live'].includes(match.status)), tab: 'fixtures' },
    { title: 'Latest Results', matches: state.results.filter((match) => match.id !== main?.id).slice(0,2), tab: 'results' },
    { title: 'Tomorrow’s Matches', matches: state.tomorrow.filter((match) => match.id !== main?.id).slice(0,2), tab: 'fixtures' }
  ].filter((section) => section.matches.length);
  return <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg,#231010,#141414)', border: '1px solid #5a2525' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Box><Typography variant="overline" sx={{ color: '#e0b08f' }}>ANJK Hockey</Typography><Typography variant="h4" sx={{ fontWeight: 900 }}>{season.name}</Typography></Box><Button component={Link} to="/anjk-3" variant="outlined">Explore</Button></Stack>
    {(state.beforeStart || (season.starts_at && new Date(season.starts_at) > new Date() && !state.results.length)) && <Stack spacing={1} sx={{ mb: 2 }}>{season.poster_url && <Box sx={{ textAlign: 'center', bgcolor: '#0c0c0c', borderRadius: 2, p: 1 }}><Box component="img" src={season.poster_url} alt={`${season.name} poster`} sx={{ display: 'block', width: 'auto', maxWidth: '100%', maxHeight: { xs: 440, md: 360 }, height: 'auto', objectFit: 'contain', mx: 'auto' }} /></Box>}{days !== null && <Typography fontWeight={800}>{days === 0 ? 'Tournament starts today' : `${days} days until the tournament`}</Typography>}</Stack>}
    {main && <Box sx={{ mb: 3 }}><Typography variant="h6" sx={{ mb: 1, color: state.live ? '#ff5555' : '#fff', fontWeight: 900 }}>{state.live ? '● LIVE NOW' : main.status === 'Completed' ? 'LATEST RESULT' : 'NEXT MATCH'}</Typography><HockeyMatchCard match={main} /></Box>}
    <Grid container spacing={2}>{sections.map(({ title, matches, tab }) => <Grid item xs={12} md={4} key={title}><Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography><Stack spacing={1}>{matches.map((match) => <HockeyMatchCard key={match.id} match={match} compact />)}</Stack><Button component={Link} to={`/anjk-3?tab=${tab}`} size="small">See all</Button></Grid>)}
    {data.standings.some((row) => row.played > 0) && <Grid item xs={12} md={4}><Typography variant="h6" sx={{ mb: 1 }}>Points Table</Typography>{[...data.standings].sort((a,b) => b.points-a.points || b.goal_difference-a.goal_difference).slice(0,4).map((row) => <Stack key={row.team_id} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom:'1px solid #333' }}><Typography>{row.team_name}</Typography><Typography fontWeight={800}>{row.points} pts</Typography></Stack>)}<Button component={Link} to="/anjk-3?tab=points-table" size="small">Full table</Button></Grid>}
    </Grid>
  </Paper>;
}
