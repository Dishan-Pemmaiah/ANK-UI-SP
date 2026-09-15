import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import HockeyMatchCard from '../../components/HockeyMatchCard';
import { roundPosition, SIMPLE_KNOCKOUT_ROUNDS, sortKnockoutRounds } from '../../services/hockeyRoundOrder';

function RoundHeader({ round, fixtures, busy, onSave, onDelete, onAddFixture }) {
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(round.name);
  return <Stack direction={{xs:'column',sm:'row'}} alignItems={{sm:'center'}} spacing={1} sx={{mb:1.5}}>
    {editing ? <><TextField size="small" select label="Round name" value={name} onChange={(e) => setName(e.target.value)} sx={{flex:1}}>{!SIMPLE_KNOCKOUT_ROUNDS.includes(round.name) && <MenuItem value={round.name}>{round.name} (current)</MenuItem>}{SIMPLE_KNOCKOUT_ROUNDS.map((label) => <MenuItem key={label} value={label}>{label}</MenuItem>)}</TextField><Button disabled={busy || !name.trim()} onClick={async () => { if (await onSave({name,is_final:name==='Final'},round.id)) setEditing(false); }}>Save name</Button><Button onClick={() => setEditing(false)}>Cancel</Button></> : <><Typography variant="h6" fontWeight={800} sx={{flex:1}}>{roundPosition(round.name)<4 ? SIMPLE_KNOCKOUT_ROUNDS[roundPosition(round.name)] : round.name}</Typography><Chip size="small" label={`${fixtures.length} ${fixtures.length===1?'fixture':'fixtures'}`} /><Button onClick={() => onAddFixture(round)} disabled={busy}>Add fixture</Button><Button onClick={() => setEditing(true)} disabled={busy}>Rename</Button><Button color="error" disabled={busy || fixtures.length>0} onClick={() => { if (window.confirm(`Delete empty round ${round.name}?`)) onDelete(round.id); }}>Delete round</Button></>}
  </Stack>;
}

function ChampionControl({ season, teams, busy, onSetChampion }) {
  const [champion,setChampion]=useState(season?.champion_team_id || '');
  useEffect(() => setChampion(season?.champion_team_id || ''),[season?.champion_team_id]);
  return <Paper sx={{p:2}}><Typography variant="h6">Champion control</Typography><Typography variant="body2" color="text.secondary" sx={{my:1}}>A completed Final sets this automatically. You can still correct or clear it here.</Typography><Stack direction={{xs:'column',sm:'row'}} spacing={1} alignItems={{sm:'center'}}><TextField select fullWidth size="small" label="Champion" value={champion} onChange={(event) => setChampion(event.target.value)}><MenuItem value="">Not decided</MenuItem>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField><Button variant="contained" disabled={busy || !onSetChampion || champion===(season?.champion_team_id || '')} onClick={() => onSetChampion(champion || null)}>Save champion</Button><Button color="error" disabled={busy || !onSetChampion || !season?.champion_team_id} onClick={() => { setChampion(''); onSetChampion(null); }}>Clear champion</Button></Stack></Paper>;
}

export default function HockeyKnockoutAdmin({ season, teams = [], matches = [], rounds = [], advancements = [], busy,
  onSaveRound, onDeleteRound, onAddFixture, onEditFixture, onDeleteFixture, onControlMatch, onRemoveAdvancement, onClearPendingLink, onSetChampion }) {
  const ordered=sortKnockoutRounds(rounds);
  const missing=SIMPLE_KNOCKOUT_ROUNDS.filter((name,index) => !ordered.some((round) => roundPosition(round.name)===index));
  const unassigned=matches.filter((match) => !match.round_id || !rounds.some((round) => round.id===match.round_id));
  const active=advancements.filter((item) => item.is_active);
  const pending=matches.filter((match) => match.next_match_id && !active.some((item) => item.source_match_id===match.id));
  return <Stack spacing={2}>
    <Paper sx={{p:2}}><Typography variant="h6">Knockout rounds</Typography><Typography color="text.secondary" variant="body2" sx={{my:1}}>Use the four standard rounds. Create each fixture in its round; results and scoring stay in Match Control.</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>{missing.map((name) => <Button key={name} variant="outlined" disabled={busy || !season} onClick={() => onSaveRound({season_id:season.id,name,sort_order:SIMPLE_KNOCKOUT_ROUNDS.indexOf(name),is_final:name==='Final'})}>Add {name}</Button>)}</Stack>
    </Paper>
    {ordered.map((round) => {
      const fixtures=matches.filter((match) => match.round_id===round.id).sort((a,b) => (a.match_number || 9999)-(b.match_number || 9999) || new Date(a.scheduled_at)-new Date(b.scheduled_at));
      return <Paper key={round.id} sx={{p:{xs:1.5,sm:2},minWidth:0}}>
        <RoundHeader key={`${round.id}-${round.name}`} round={round} fixtures={fixtures} busy={busy} onSave={onSaveRound} onDelete={onDeleteRound} onAddFixture={onAddFixture} />
        <Stack spacing={1.5}>{fixtures.map((match) => <Box key={match.id} sx={{minWidth:0}}><HockeyMatchCard match={{...match,round_name:roundPosition(round.name)<4?SIMPLE_KNOCKOUT_ROUNDS[roundPosition(round.name)]:round.name}} compact /><Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center" sx={{mt:0.5}}><Typography variant="body2" color="text.secondary" sx={{flex:1,minWidth:150}}>Winner: {teams.find((team) => team.id===match.winner_team_id)?.name || 'To be confirmed'}</Typography><Button size="small" onClick={() => onEditFixture(match)}>Edit fixture</Button><Button size="small" onClick={() => onControlMatch(match)}>Match Control</Button><Button size="small" color="error" onClick={() => onDeleteFixture(match)}>Delete fixture</Button></Stack></Box>)}
          {!fixtures.length && <Typography color="text.secondary">No fixtures yet. Select Add fixture to create one.</Typography>}
        </Stack>
      </Paper>;
    })}
    {unassigned.length>0 && <Paper sx={{p:2}}><Typography variant="h6">Other / unassigned fixtures</Typography><Typography variant="body2" color="text.secondary" sx={{mb:1}}>These existing fixtures are preserved. Edit their round or delete an unwanted fixture individually.</Typography><Stack spacing={1.5}>{unassigned.map((match) => <Box key={match.id}><HockeyMatchCard match={match} compact /><Stack direction="row" flexWrap="wrap" gap={1}><Button onClick={() => onEditFixture(match)}>Edit fixture</Button><Button onClick={() => onControlMatch(match)}>Match Control</Button><Button color="error" onClick={() => onDeleteFixture(match)}>Delete fixture</Button></Stack></Box>)}</Stack></Paper>}
    <ChampionControl season={season} teams={teams} busy={busy} onSetChampion={onSetChampion} />
    {active.length>0 && <Paper sx={{p:2}}><Typography variant="h6">Existing linked placements</Typography><Alert severity="info" sx={{my:1}}>Earlier winner or bye placements are kept. Clear one before correcting its source result or deleting a linked fixture. A started destination cannot be changed.</Alert><Stack spacing={1}>{active.map((item) => <Stack key={item.id} direction={{xs:'column',sm:'row'}} spacing={1} alignItems={{sm:'center'}}><Typography sx={{flex:1,overflowWrap:'anywhere'}}>{teams.find((team) => team.id===item.team_id)?.name || 'Team'} → {matches.find((match) => match.id===item.target_match_id)?.display_label || 'Fixture'} / {item.target_slot==='home'?'Team A':'Team B'} ({item.kind})</Typography><Button color="error" disabled={busy} onClick={() => { if (window.confirm('Clear this linked placement from the unstarted fixture?')) onRemoveAdvancement(item.id); }}>Clear placement</Button></Stack>)}</Stack></Paper>}
    {pending.length>0 && <Paper sx={{p:2}}><Typography variant="h6">Pending next-match links</Typography><Typography variant="body2" color="text.secondary" sx={{mb:1}}>Clear a planned link before deleting either fixture.</Typography>{pending.map((match) => <Stack key={match.id} direction={{xs:'column',sm:'row'}} spacing={1} alignItems={{sm:'center'}}><Typography sx={{flex:1}}>{match.display_label} → {matches.find((item) => item.id===match.next_match_id)?.display_label || 'Fixture'}</Typography><Button color="error" disabled={busy} onClick={() => { if (window.confirm('Clear this unfilled next-match link?')) onClearPendingLink(match.id); }}>Clear pending link</Button></Stack>)}</Paper>}
  </Stack>;
}
