import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { fixtureLabel } from '../../services/tournamentState';
import { roundPosition, SIMPLE_KNOCKOUT_ROUNDS, sortKnockoutRounds } from '../../services/hockeyRoundOrder';

function TeamLine({ team, fallback, score, winner }) {
  const name=team?.name || fallback || 'TBD';
  return <Stack direction="row" alignItems="center" spacing={1} sx={{minWidth:0,py:0.5}}>
    <Avatar src={team?.logo_url || undefined} sx={{width:28,height:28,bgcolor:'#552020',fontSize:14,flexShrink:0}}>{team?.name?.[0] || '?'}</Avatar>
    <Typography title={name} sx={{minWidth:0,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:winner?900:600,color:winner?'#f5dfb6':'inherit'}}>{name}</Typography>
    {score!=null && <Typography fontWeight={900} sx={{flexShrink:0}}>{score}</Typography>}
  </Stack>;
}

function Fixture({ match, basePath, roundName }) {
  const finished=['Live','Completed'].includes(match.status);
  return <Paper sx={{p:1.5,border:'1px solid rgba(255,255,255,.14)',borderRadius:2,minWidth:0}}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}><Typography variant="caption" sx={{color:'#dcb99b',minWidth:0}}>{fixtureLabel(roundName==='Other / unassigned fixtures'?match:{...match,round_name:roundName})} · {new Date(match.scheduled_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'})} IST</Typography><Chip size="small" label={match.status} sx={{flexShrink:0}} /></Stack>
    {match.venue && <Typography variant="caption" color="text.secondary" sx={{display:'block',mb:0.75}}>Venue: {match.venue}</Typography>}
    <TeamLine team={match.home} fallback={match.home_slot_label} score={finished?match.home_score:null} winner={match.status==='Completed' && match.winner_team_id===match.home_team_id} />
    <TeamLine team={match.away} fallback={match.away_slot_label} score={finished?match.away_score:null} winner={match.status==='Completed' && match.winner_team_id===match.away_team_id} />
    {match.status==='Completed' && match.winner_team_id && <Typography variant="caption" color="text.secondary">Winner: {match.winner_team_id===match.home_team_id?match.home?.name:match.away?.name}{match.decision_method?` · ${match.decision_method}`:''}</Typography>}
    <Button component={Link} to={`${basePath}?tab=${match.status==='Completed'?'results':match.status==='Live'?'live':'fixtures'}#match-${match.id}`} size="small" sx={{mt:0.5,minHeight:40}}>View match</Button>
  </Paper>;
}

export default function HockeyKnockoutBracket({ rounds = [], matches = [], teams = [], championId, basePath = '/anjk-3' }) {
  const ordered=sortKnockoutRounds(rounds);
  const unassigned=matches.filter((match) => !match.round_id || !rounds.some((round) => round.id===match.round_id));
  const columns=[...ordered.map((round) => ({id:round.id,name:roundPosition(round.name)<4?SIMPLE_KNOCKOUT_ROUNDS[roundPosition(round.name)]:round.name,
    matches:matches.filter((match) => match.round_id===round.id).sort((a,b) => (a.match_number || 9999)-(b.match_number || 9999))})),
    ...(unassigned.length?[{id:'legacy',name:'Other / unassigned fixtures',matches:unassigned}]:[])];
  const champion=teams.find((team) => team.id===championId);
  if (!columns.length) return <Typography color="text.secondary">Knockout rounds will appear when the organizer adds them.</Typography>;
  return <Box sx={{minWidth:0}}><Typography variant="h5" sx={{mb:2}}>Knockout rounds</Typography>
    <Box sx={{width:'100%',maxWidth:'100%',overflowX:{xs:'visible',md:'auto'}}}>
      <Box sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',md:`repeat(${columns.length+1}, minmax(260px, 1fr))`},gap:2,minWidth:{md:(columns.length+1)*260},pb:1}}>
        {columns.map((round) => <Box key={round.id} sx={{minWidth:0}}><Typography variant="h6" sx={{mb:1,color:'#dcb99b'}}>{round.name}</Typography><Stack spacing={1.5}>{round.matches.length?round.matches.map((match) => <Fixture key={match.id} match={match} roundName={round.name} basePath={basePath} />):<Paper sx={{p:2,color:'#aaa'}}>Fixtures to be decided</Paper>}</Stack></Box>)}
        <Box sx={{minWidth:0}}><Typography variant="h6" sx={{mb:1,color:'#dcb99b'}}>Champion</Typography><Paper sx={{p:2,border:'1px solid #9d7144',textAlign:'center'}}><Typography variant="h4">🏆</Typography><Typography fontWeight={900} sx={{overflowWrap:'anywhere'}}>{champion?.name || 'To be confirmed'}</Typography></Paper></Box>
      </Box>
    </Box>
  </Box>;
}
