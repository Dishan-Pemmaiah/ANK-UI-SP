import { Box, Paper, Stack, Typography } from '@mui/material';
import HockeyMatchCard from '../../components/HockeyMatchCard';

export default function HockeyKnockoutBracket({ rounds = [], matches = [], teams = [], championId, basePath = '/anjk-3' }) {
  const ordered = [...rounds].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const unassigned = matches.filter((match) => !match.round_id);
  const columns = [...ordered.map((round) => ({ id: round.id, name: round.name, matches: matches.filter((match) => match.round_id === round.id) })),
    ...(unassigned.length ? [{ id: 'legacy', name: 'Unassigned fixtures', matches: unassigned }] : [])];
  const champion = teams.find((team) => team.id === championId);
  if (!columns.length) return <Typography color="text.secondary">Rounds will appear here when the organizer adds them.</Typography>;
  return <Box>
    <Typography variant="h5" sx={{ mb: 2 }}>Knockout rounds</Typography>
    <Box sx={{ display: 'grid', gridAutoFlow: { xs: 'row', md: 'column' }, gridAutoColumns: { md: 'minmax(230px, 1fr)' }, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: `repeat(${columns.length + 1}, minmax(230px, 1fr))` }, gap: 2, overflowX: { md: 'auto' }, pb: 1 }}>
      {columns.map((round) => <Box key={round.id} sx={{ minWidth: 0 }}><Typography variant="h6" sx={{ mb: 1, color: '#dcb99b' }}>{round.name}</Typography><Stack spacing={1.5}>{round.matches.length ? round.matches.map((match) => <HockeyMatchCard key={match.id} match={match} compact basePath={basePath} />) : <Paper sx={{ p: 2, color: '#aaa' }}>Fixtures to be decided</Paper>}</Stack></Box>)}
      <Box sx={{ minWidth: 0 }}><Typography variant="h6" sx={{ mb: 1, color: '#dcb99b' }}>Champion</Typography><Paper sx={{ p: 2, border: '1px solid #9d7144', textAlign: 'center' }}><Typography variant="h4">🏆</Typography><Typography fontWeight={900} sx={{ overflowWrap: 'anywhere' }}>{champion?.name || 'To be confirmed'}</Typography></Paper></Box>
    </Box>
  </Box>;
}
