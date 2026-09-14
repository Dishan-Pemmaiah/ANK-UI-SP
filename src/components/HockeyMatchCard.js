import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { fixtureLabel } from '../services/tournamentState';

const Team = ({ team, away, slotLabel }) => <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, justifyContent: away ? 'flex-start' : 'flex-end' }}>
  <Avatar src={team?.logo_url || undefined} alt={team?.name || ''} sx={{ width: { xs: 30, sm: 36 }, height: { xs: 30, sm: 36 }, bgcolor: '#552020', flexShrink: 0 }}>{team?.name?.[0]}</Avatar>
  <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere', minWidth: 0, textAlign: away ? 'left' : 'right', fontSize: { xs: '.85rem', sm: '1rem' } }}>{team?.name || slotLabel || 'TBD'}</Typography>
</Stack>;

export default function HockeyMatchCard({ match, compact = false, basePath = '/anjk-3' }) {
  return <Paper sx={{ p: compact ? 1.5 : 2, border: '1px solid rgba(255,255,255,.12)', borderRadius: 3, bgcolor: '#171717' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1.5 }}>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: '#dcb99b' }}>{fixtureLabel(match) || 'Hockey'} · {new Date(match.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</Typography>
        {match.venue && <Typography variant="caption" sx={{ color: '#aaa', overflowWrap: 'anywhere' }}>Venue: {match.venue}</Typography>}
      </Stack>
      <Chip size="small" label={match.status === 'Live' ? `● LIVE · ${match.phase || '1st Half'}` : match.status} sx={{ bgcolor: match.status === 'Live' ? '#b30000' : '#333', color: '#fff', fontWeight: 800 }} />
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
      <Team team={match.home} slotLabel={match.home_slot_label} />
      <Typography sx={{ fontWeight: 900, fontSize: compact ? '1.25rem' : { xs: '1.4rem', sm: '1.7rem' }, whiteSpace: 'nowrap', textAlign: 'center' }}>
        {['Live', 'Completed'].includes(match.status) ? `${match.home_score} – ${match.away_score}` : 'vs'}
      </Typography>
      <Team team={match.away} away slotLabel={match.away_slot_label} />
    </Box>
    {match.status === 'Completed' && match.winner_team_id && <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#dcb99b', mt: 0.75 }}>
      Winner: {match.winner_team_id === match.home_team_id ? match.home?.name : match.away?.name} · {match.decision_method || 'Normal'}{match.decision_method === 'Shootout' ? ` ${match.shootout_home}–${match.shootout_away}` : ''}
    </Typography>}
    {match.match_note && <Typography variant="body2" sx={{ mt: 1.5, px: 1, py: 0.75, bgcolor: '#2b221a', borderLeft: '3px solid #dcb99b', overflowWrap: 'anywhere' }}>Match update: {match.match_note}</Typography>}
    {!compact && <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: 1.5 }}>
      <Button component={Link} to={`${basePath}?tab=${match.status === 'Live' ? 'live' : match.status === 'Completed' ? 'results' : 'fixtures'}#match-${match.id}`} size="small">View Match</Button>
    </Stack>}
  </Paper>;
}
