import { useState } from 'react';
import { Box, Button, Chip, FormControlLabel, Grid, MenuItem, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import HockeyMatchCard from '../../components/HockeyMatchCard';

const slotName = (slot) => slot === 'home' ? 'Team A' : 'Team B';
const activeFor = (advancements, match) => advancements.find((item) => item.is_active && item.source_match_id === match.id);
const targetLabel = (matches, id) => matches.find((match) => match.id === id)?.display_label || 'Match';

function RoundEditor({ round, busy, onSave, onDelete, onMove, used }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(round.name);
  const [final, setFinal] = useState(round.is_final);
  return <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
    {editing ? <><TextField size="small" label="Round name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} /><FormControlLabel control={<Switch checked={final} onChange={(e) => setFinal(e.target.checked)} />} label="Final round" /><Button disabled={busy || !name.trim()} onClick={async () => { if (await onSave({ name: name.trim(), is_final: final }, round.id)) setEditing(false); }}>Save round</Button><Button onClick={() => setEditing(false)}>Cancel</Button></> : <><Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>{round.name}{round.is_final ? ' · Final' : ''}</Typography><Button size="small" disabled={busy} onClick={() => onMove(round, -1)}>↑ Move up</Button><Button size="small" disabled={busy} onClick={() => onMove(round, 1)}>↓ Move down</Button><Button size="small" onClick={() => setEditing(true)}>Edit</Button><Button size="small" color="error" disabled={busy || used} onClick={() => { if (window.confirm(`Delete unused round ${round.name}?`)) onDelete(round.id); }}>Delete</Button></>}
  </Stack>;
}

function ProgressionEditor({ match, matches, rounds, advancements, busy, onSetProgression, onAdvanceWinner, onRemove, onSetWinner }) {
  const [targetId, setTargetId] = useState(match.next_match_id || '');
  const [slot, setSlot] = useState(match.next_slot || 'home');
  const [automatic, setAutomatic] = useState(Boolean(match.auto_advance));
  const [winner, setWinner] = useState(match.winner_team_id || '');
  const [method, setMethod] = useState(match.decision_method || 'Normal');
  const [shootoutHome, setShootoutHome] = useState(match.shootout_home ?? '');
  const [shootoutAway, setShootoutAway] = useState(match.shootout_away ?? '');
  const active = activeFor(advancements, match);
  const possible = matches.filter((item) => item.id !== match.id && ['Upcoming', 'Postponed'].includes(item.status) &&
    (!match.round_id || !item.round_id || (rounds.find((round) => round.id === item.round_id)?.sort_order ?? -1) > (rounds.find((round) => round.id === match.round_id)?.sort_order ?? -1)));
  return <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5 }}><Stack spacing={1.5}>
    {match.status === 'Completed' && <><Typography fontWeight={800}>Confirm / correct winner</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField select size="small" label="Winner" value={winner} onChange={(e) => setWinner(e.target.value)} fullWidth><MenuItem value="">Select winner</MenuItem>{[match.home, match.away].filter(Boolean).map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField>
      <TextField select size="small" label="Decision" value={method} onChange={(e) => setMethod(e.target.value)} fullWidth>{['Normal', 'Shootout', 'Walkover', 'Other'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
    </Stack>{method === 'Shootout' && <Stack direction="row" spacing={1}><TextField size="small" type="number" label="Team A shootout" value={shootoutHome} onChange={(e) => setShootoutHome(e.target.value)} inputProps={{ min: 0 }} /><TextField size="small" type="number" label="Team B shootout" value={shootoutAway} onChange={(e) => setShootoutAway(e.target.value)} inputProps={{ min: 0 }} /></Stack>}
      <Button size="small" variant="outlined" disabled={busy || !winner || Boolean(active) || (method === 'Shootout' && (shootoutHome === '' || shootoutAway === ''))} onClick={() => onSetWinner(match.id, winner, method, method === 'Shootout' ? Number(shootoutHome) : null, method === 'Shootout' ? Number(shootoutAway) : null)} sx={{ alignSelf: 'flex-start' }}>Save winner correction</Button>
      {active && <Typography variant="caption" color="text.secondary">Remove the advancement before correcting this winner.</Typography>}</>}
    <Typography fontWeight={800}>Winner progression</Typography>
    <TextField select size="small" label="Next match" value={targetId} onChange={(e) => setTargetId(e.target.value)} fullWidth><MenuItem value="">Decide later / no destination</MenuItem>{possible.map((item) => <MenuItem key={item.id} value={item.id}>{item.display_label} · {rounds.find((round) => round.id === item.round_id)?.name || 'Unassigned round'}</MenuItem>)}</TextField>
    {targetId && <TextField select size="small" label="Target slot" value={slot} onChange={(e) => setSlot(e.target.value)} fullWidth><MenuItem value="home">Team A</MenuItem><MenuItem value="away">Team B</MenuItem></TextField>}
    <FormControlLabel control={<Switch checked={automatic} onChange={(e) => setAutomatic(e.target.checked)} disabled={!targetId || busy} />} label="Automatic advancement when winner is confirmed" />
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Button variant="outlined" disabled={busy || Boolean(active)} onClick={() => onSetProgression(match.id, targetId, targetId ? slot : null, targetId && automatic)}>Save next-match assignment</Button>
      {match.status === 'Completed' && targetId && !active && <Button variant="contained" disabled={busy || !match.winner_team_id} onClick={() => onAdvanceWinner(match.id, targetId, slot)}>Advance winner now</Button>}
      {active && <Button color="error" variant="outlined" disabled={busy} onClick={() => { if (window.confirm('Remove this advancement and clear the unstarted destination slot?')) onRemove(active.id); }}>Correct / remove advancement</Button>}
    </Stack>
    <Typography variant="body2" color="text.secondary">{active ? `Advanced to ${targetLabel(matches, active.target_match_id)} / ${slotName(active.target_slot)}` : match.next_match_id ? `Assigned to ${targetLabel(matches, match.next_match_id)} / ${slotName(match.next_slot)} · ${match.auto_advance ? 'Automatic' : 'Decide later'}` : 'Not assigned'}</Typography>
  </Stack></Paper>;
}

export default function HockeyKnockoutAdmin({ season, teams = [], matches = [], rounds = [], advancements = [], busy, onSaveRound, onDeleteRound, onMoveRound, onEditFixture, onControlMatch, onSetProgression, onAdvanceWinner, onAssignBye, onRemoveAdvancement, onSetWinner, onSetChampion }) {
  const [roundName, setRoundName] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [openMatch, setOpenMatch] = useState(null);
  const [bye, setBye] = useState({ team: '', round: '', match: '', slot: 'home', note: '' });
  const ordered = [...rounds].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const activeByes = advancements.filter((item) => item.is_active && item.kind === 'Bye');
  const roundOptions = [...ordered, { id: '', name: 'Unassigned round' }];
  return <Stack spacing={2}>
    <Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 1.5 }}>Organize rounds</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField size="small" label="New round name" value={roundName} onChange={(e) => setRoundName(e.target.value)} sx={{ flex: 1 }} /><FormControlLabel control={<Switch checked={isFinal} onChange={(e) => setIsFinal(e.target.checked)} />} label="Final round" /><Button variant="contained" disabled={busy || !season || !roundName.trim()} onClick={async () => { if (await onSaveRound({ season_id: season.id, name: roundName.trim(), sort_order: ordered.length ? Math.max(...ordered.map((round) => round.sort_order)) + 1 : 0, is_final: isFinal })) { setRoundName(''); setIsFinal(false); } }}>Add round</Button></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Create only the rounds you need. Unused rounds can be edited, moved, or deleted.</Typography></Paper>
    <Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 1.5 }}>Assign bye / direct advance</Typography><Grid container spacing={1.5}>
      <Grid item xs={12} sm={6}><TextField select fullWidth size="small" label="Team receiving bye" value={bye.team} onChange={(e) => setBye({ ...bye, team: e.target.value })}><MenuItem value="">Select team</MenuItem>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField select fullWidth size="small" label="Target round" value={bye.round} onChange={(e) => setBye({ ...bye, round: e.target.value, match: '' })}><MenuItem value="">Select round</MenuItem>{ordered.map((round) => <MenuItem key={round.id} value={round.id}>{round.name}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField select fullWidth size="small" label="Target fixture" value={bye.match} onChange={(e) => setBye({ ...bye, match: e.target.value })} disabled={!bye.round}><MenuItem value="">Select fixture</MenuItem>{matches.filter((match) => match.round_id === bye.round && ['Upcoming','Postponed'].includes(match.status)).map((match) => <MenuItem key={match.id} value={match.id}>{match.display_label}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField select fullWidth size="small" label="Target slot" value={bye.slot} onChange={(e) => setBye({ ...bye, slot: e.target.value })}><MenuItem value="home">Team A</MenuItem><MenuItem value="away">Team B</MenuItem></TextField></Grid>
      <Grid item xs={12}><TextField fullWidth size="small" label="Reason (optional)" value={bye.note} onChange={(e) => setBye({ ...bye, note: e.target.value })} /></Grid>
    </Grid><Button variant="contained" sx={{ mt: 1.5 }} disabled={busy || !bye.team || !bye.match} onClick={async () => { if (await onAssignBye(bye.team, bye.match, bye.slot, bye.note)) setBye({ team: '', round: '', match: '', slot: 'home', note: '' }); }}>Assign bye</Button>
      {activeByes.map((item) => <Stack key={item.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mt: 1.5 }}><Typography sx={{ flex: 1 }}>{teams.find((team) => team.id === item.team_id)?.name} → {targetLabel(matches, item.target_match_id)} / {slotName(item.target_slot)}{item.note ? ` · ${item.note}` : ''}</Typography><Button size="small" color="error" disabled={busy} onClick={() => { if (window.confirm('Remove this bye from the unstarted destination fixture?')) onRemoveAdvancement(item.id); }}>Remove / change bye</Button></Stack>)}
    </Paper>
    {roundOptions.map((round) => {
      const fixtures = matches.filter((match) => (match.round_id || '') === round.id);
      if (!round.id && !fixtures.length) return null;
      return <Paper key={round.id || 'unassigned'} sx={{ p: { xs: 1.5, sm: 2 } }}>
        {round.id ? <RoundEditor round={round} busy={busy} used={fixtures.length > 0} onSave={onSaveRound} onDelete={onDeleteRound} onMove={onMoveRound} /> : <Typography variant="h6" sx={{ mb: 1 }}>Unassigned legacy fixtures</Typography>}
        <Stack spacing={1.5}>{fixtures.length ? fixtures.map((match) => {
          const active = activeFor(advancements, match);
          return <Box key={match.id}><HockeyMatchCard match={match} compact /><Stack direction="row" flexWrap="wrap" useFlexGap gap={0.5} alignItems="center" sx={{ mt: 0.5 }}><Chip size="small" label={match.display_label || match.round_label || 'Fixture'} /><Typography variant="caption" sx={{ flex: 1, minWidth: 130 }}>{match.status === 'Completed' ? `Winner: ${teams.find((team) => team.id === match.winner_team_id)?.name || 'Needs confirmation'}` : match.status} · {active ? `Advanced to ${targetLabel(matches, active.target_match_id)} / ${slotName(active.target_slot)}` : 'Not advanced'}</Typography><Button size="small" onClick={() => onEditFixture(match)}>Edit fixture</Button><Button size="small" onClick={() => onControlMatch(match)}>Control match</Button><Button size="small" onClick={() => setOpenMatch(openMatch === match.id ? null : match.id)}>{openMatch === match.id ? 'Close' : 'Progression / winner'}</Button></Stack>
            {openMatch === match.id && <ProgressionEditor key={match.id} match={match} matches={matches} rounds={rounds} advancements={advancements} busy={busy} onSetProgression={onSetProgression} onAdvanceWinner={onAdvanceWinner} onRemove={onRemoveAdvancement} onSetWinner={onSetWinner} />}
            {round.is_final && match.status === 'Completed' && match.winner_team_id && season.champion_team_id !== match.winner_team_id && <Button size="small" onClick={() => onSetChampion(match.winner_team_id)}>Set winner as champion</Button>}
          </Box>;
        }) : <Typography color="text.secondary">No fixtures in this round yet. Create one in Fixtures.</Typography>}</Stack>
      </Paper>;
    })}
  </Stack>;
}
