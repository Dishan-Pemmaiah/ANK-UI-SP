import { Avatar, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { fixtureLabel } from '../services/tournamentState';

const Team = ({ team }) => <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
  <Avatar src={team?.logo_url || undefined} alt={team?.name || ''} sx={{ width: 36, height: 36, bgcolor: '#552020' }}>{team?.name?.[0]}</Avatar>
  <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{team?.name || 'TBD'}</Typography>
</Stack>;

export default function HockeyMatchCard({ match, compact = false, basePath = '/anjk-3' }) {
  return <Paper sx={{ p: compact ? 1.5 : 2, border: '1px solid rgba(255,255,255,.12)', borderRadius: 3, bgcolor: '#171717' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#dcb99b' }}>{fixtureLabel(match) || 'Hockey'} · {new Date(match.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</Typography>
      <Chip size="small" label={match.status === 'Live' ? `● LIVE · ${match.phase || '1st Half'}` : match.status} sx={{ bgcolor: match.status === 'Live' ? '#b30000' : '#333', color: '#fff', fontWeight: 800 }} />
    </Stack>
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
      <Team team={match.home} />
      <Typography sx={{ fontWeight: 900, fontSize: compact ? '1.25rem' : '1.7rem', whiteSpace: 'nowrap', px: 1 }}>
        {['Live', 'Completed'].includes(match.status) ? `${match.home_score} – ${match.away_score}` : 'vs'}
      </Typography>
      <Team team={match.away} />
    </Stack>
    {!compact && <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#aaa' }}>{match.venue || ''}</Typography>
      <Button component={Link} to={`${basePath}?tab=${match.status === 'Live' ? 'live' : match.status === 'Completed' ? 'results' : 'fixtures'}#match-${match.id}`} size="small">View Match</Button>
    </Stack>}
  </Paper>;
}
