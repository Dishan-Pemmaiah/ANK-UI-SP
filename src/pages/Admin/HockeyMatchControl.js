import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import HockeyMatchCard from '../../components/HockeyMatchCard';

function GoalCorrections({ match, players, events, busy, onSave }) {
  const [drafts, setDrafts] = useState({});
  const [newTeam, setNewTeam] = useState('');
  const [newScorer, setNewScorer] = useState('');
  const goals = events.filter((event) => event.match_id === match.id && event.event_type === 'Goal' && !event.is_voided).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const teams = [match.home, match.away];
  const teamName = (id) => teams.find((team) => team?.id === id)?.name || 'Team';
  const playerOptions = (teamId) => players.filter((player) => player.team_id === teamId);
  return <Paper sx={{ p: 2 }}>
    <Typography variant="h6" sx={{ mb: 0.5 }}>Correct goals and scorers</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Edit the scorer or remove a specific goal. Each saved goal change updates the match score and player credit together.</Typography>
    <Stack spacing={1.5}>
      {goals.map((goal, index) => <Paper key={goal.id} variant="outlined" sx={{ p: 1.5 }}>
        <Typography fontWeight={800} sx={{ mb: 1 }}>Goal {index + 1} · {teamName(goal.team_id)}</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} sx={{ minWidth: 0 }}>
          <TextField select fullWidth size="small" label={`Scorer for goal ${index + 1}`} value={drafts[goal.id] ?? goal.player_id ?? ''} onChange={(event) => setDrafts((prev) => ({ ...prev, [goal.id]: event.target.value }))} sx={{ minWidth: 0, flex: 1 }}>
            <MenuItem value="">Unassigned</MenuItem>{playerOptions(goal.team_id).map((player) => <MenuItem key={player.id} value={player.id}>{player.shirt_number === null ? '' : `#${player.shirt_number} `}{player.name}</MenuItem>)}
          </TextField>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ flexShrink: 0 }}><Button disabled={busy || (drafts[goal.id] ?? goal.player_id ?? '') === (goal.player_id ?? '')} onClick={() => onSave('assign', goal.id, goal.team_id, drafts[goal.id] ?? '')} sx={{ whiteSpace: 'nowrap' }}>Save scorer</Button>
          <Button color="error" disabled={busy} onClick={() => { if (window.confirm(`Remove goal ${index + 1} for ${teamName(goal.team_id)}? The score will decrease by one.`)) onSave('remove', goal.id, goal.team_id); }} sx={{ whiteSpace: 'nowrap' }}>Remove goal</Button></Stack>
        </Stack>
      </Paper>)}
      {!goals.length && <Typography color="text.secondary">No recorded goals for this match.</Typography>}
    </Stack>
    <Typography fontWeight={800} sx={{ mt: 3, mb: 1 }}>Add missed goal</Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField select size="small" label="Scoring team" value={newTeam} onChange={(event) => { setNewTeam(event.target.value); setNewScorer(''); }} sx={{ minWidth: 180 }}><MenuItem value="">Select team</MenuItem>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField>
      <TextField select size="small" label="Scorer (optional)" value={newScorer} onChange={(event) => setNewScorer(event.target.value)} disabled={!newTeam} sx={{ minWidth: 180 }}><MenuItem value="">Unassigned</MenuItem>{playerOptions(newTeam).map((player) => <MenuItem key={player.id} value={player.id}>{player.shirt_number === null ? '' : `#${player.shirt_number} `}{player.name}</MenuItem>)}</TextField>
      <Button variant="contained" disabled={busy || !newTeam} onClick={async () => { if (await onSave('add', null, newTeam, newScorer)) setNewScorer(''); }}>Add and save goal</Button>
    </Stack>
  </Paper>;
}

function MatchExtras({ match, busy, onSaveNote, onAddPlayer }) {
  const [note, setNote] = useState(match.match_note || '');
  const [teamId, setTeamId] = useState(match.home?.id || '');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  return <Stack spacing={2}>
    <Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 0.5 }}>Match update</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Visible on this fixture whether it is upcoming, live, postponed, or completed. Record rain delays, sudden death, tie-breakers, or other context here. The score and standings remain separate.</Typography><TextField fullWidth multiline minRows={2} label="Public match note" value={note} onChange={(e) => setNote(e.target.value)} inputProps={{ maxLength: 500 }} helperText={`${note.length}/500 characters`} /><Button sx={{ mt: 1 }} variant="outlined" disabled={busy || note.trim() === (match.match_note || '')} onClick={() => onSaveNote(note.trim())}>Save match update</Button></Paper>
    <Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 0.5 }}>Add player for this match</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>The player is saved to the selected team's roster and becomes available as a scorer.</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField select size="small" label="Team" value={teamId} onChange={(e) => setTeamId(e.target.value)} sx={{ minWidth: { sm: 175 } }}>{[match.home, match.away].filter(Boolean).map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField><TextField size="small" label="Player name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} /><TextField size="small" type="number" label="Jersey (optional)" value={number} onChange={(e) => setNumber(e.target.value)} inputProps={{ min: 0, max: 99 }} sx={{ width: { sm: 150 } }} /></Stack><Button sx={{ mt: 1.5 }} variant="contained" disabled={busy || !teamId || !name.trim() || (number !== '' && (!Number.isInteger(Number(number)) || Number(number) < 0 || Number(number) > 99))} onClick={async () => { if (await onAddPlayer(teamId, name.trim(), number)) { setName(''); setNumber(''); } }}>Add player to team</Button></Paper>
  </Stack>;
}

export default function HockeyMatchControl({ matches, players, events = [], selectedMatch, selectMatch, scorers, setScorers, busy, matchAction, correct, setCorrect, saveCorrection, saveGoalCorrection, onSaveNote, onAddPlayer, requestDeleteMatch, confirmEnd, setConfirmEnd }) {
  const teamPlayers = (teamId) => players.filter((player) => player.team_id === teamId);
  return <Stack spacing={2}>
    <TextField select fullWidth size="small" label="Select match" value={selectedMatch?.id || ''} onChange={(event) => selectMatch(matches.find((match) => match.id === event.target.value))}>
      <MenuItem value="">Choose a match</MenuItem>
      {matches.map((match) => <MenuItem key={match.id} value={match.id}>{match.home?.name} vs {match.away?.name} · {match.status}</MenuItem>)}
    </TextField>
    {selectedMatch && <>
      <HockeyMatchCard match={selectedMatch} />
      {selectedMatch.status === 'Upcoming' && <Button fullWidth size="large" variant="contained" disabled={busy} onClick={() => matchAction('start')} sx={{ py: 2, fontWeight: 900 }}>START MATCH</Button>}
      {selectedMatch.status === 'Live' && <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid #a33' }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 1 }}><Chip label={`● ${selectedMatch.phase || '1st Half'}`} color="error" /><Typography variant="caption" color="text.secondary">Match phase</Typography></Stack>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={{ xs: 1, sm: 3 }} sx={{ mb: 2 }}>
          <Typography sx={{ flex: 1, textAlign: 'right', fontWeight: 800, overflowWrap: 'anywhere' }}>{selectedMatch.home?.name}</Typography>
          <Typography aria-label="Current score" sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', sm: '3.5rem' }, whiteSpace: 'nowrap', lineHeight: 1 }}>{selectedMatch.home_score} – {selectedMatch.away_score}</Typography>
          <Typography sx={{ flex: 1, fontWeight: 800, overflowWrap: 'anywhere' }}>{selectedMatch.away?.name}</Typography>
        </Stack>
        <Grid container spacing={1.5}>{[['home', selectedMatch.home], ['away', selectedMatch.away]].map(([side, team]) => <Grid item xs={6} key={side}>
          <TextField select fullWidth size="small" label={`${team.name} scorer (optional)`} value={scorers[side]} onChange={(event) => setScorers((prev) => ({ ...prev, [side]: event.target.value }))} sx={{ mb: 1 }}>
            <MenuItem value="">No scorer selected</MenuItem>{teamPlayers(team.id).map((player) => <MenuItem key={player.id} value={player.id}>{player.shirt_number === null ? '' : `#${player.shirt_number} `}{player.name}</MenuItem>)}
          </TextField>
          <Button fullWidth variant="contained" disabled={busy} onClick={() => matchAction(`${side}_goal`, team.id, scorers[side])} sx={{ minHeight: 58, fontWeight: 900, fontSize: { xs: '0.85rem', sm: '1.1rem' }, overflowWrap: 'anywhere' }}>{team.name} + Goal</Button>
          <Button fullWidth variant="text" color="inherit" disabled={busy || selectedMatch[`${side}_score`] === 0} onClick={() => matchAction(`${side}_undo`, team.id)} sx={{ mt: 0.5, minHeight: 44, color: '#aaa' }}>Undo {team.name} goal</Button>
        </Grid>)}</Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {selectedMatch.phase === '1st Half' && <Button fullWidth variant="outlined" disabled={busy} onClick={() => matchAction('phase_half')}>Half Time</Button>}
          {selectedMatch.phase === 'Half Time' && <Button fullWidth variant="outlined" disabled={busy} onClick={() => matchAction('phase_second')}>Start 2nd Half</Button>}
        </Stack>
        <Box sx={{ borderTop: '1px solid #555', mt: 2, pt: 2 }}><Button fullWidth color="error" variant="contained" disabled={busy} onClick={() => setConfirmEnd(true)} sx={{ minHeight: 58, fontWeight: 900 }}>END MATCH</Button></Box>
      </Paper>}
      {['Upcoming', 'Live'].includes(selectedMatch.status) && <Stack direction="row" spacing={1}><Button disabled={busy} onClick={() => { if (window.confirm('Postpone this match?')) matchAction('postpone'); }}>Postpone</Button><Button disabled={busy} color="error" onClick={() => { if (window.confirm('Cancel this match?')) matchAction('cancel'); }}>Cancel</Button></Stack>}
      {selectedMatch.status === 'Completed' && <Paper sx={{ p: 2 }}><Typography variant="h6">Correct final result</Typography><Typography variant="body2" color="text.secondary">Changing the total adds unassigned goals or removes the most recent goals. For a specific goal or player, use the corrections below.</Typography><Stack direction="row" spacing={1} sx={{ mt: 2 }}><TextField fullWidth size="small" type="number" label={selectedMatch.home?.name} value={correct.home} onChange={(event) => setCorrect({ ...correct, home: event.target.value })} inputProps={{ min: 0 }} /><TextField fullWidth size="small" type="number" label={selectedMatch.away?.name} value={correct.away} onChange={(event) => setCorrect({ ...correct, away: event.target.value })} inputProps={{ min: 0 }} /></Stack><Button sx={{ mt: 2 }} disabled={busy || correct.home === '' || correct.away === '' || !Number.isInteger(Number(correct.home)) || !Number.isInteger(Number(correct.away)) || Number(correct.home) < 0 || Number(correct.away) < 0} onClick={saveCorrection}>Save correction</Button></Paper>}
      <MatchExtras key={selectedMatch.id} match={selectedMatch} busy={busy} onSaveNote={onSaveNote} onAddPlayer={onAddPlayer} />
      {['Live', 'Completed'].includes(selectedMatch.status) && <GoalCorrections key={selectedMatch.id} match={selectedMatch} players={players} events={events} busy={busy} onSave={saveGoalCorrection} />}
      <Button color="error" variant="outlined" disabled={busy} onClick={() => requestDeleteMatch(selectedMatch)} sx={{ alignSelf: 'flex-start' }}>Delete match</Button>
    </>}
    <Dialog open={confirmEnd} onClose={() => { if (!busy) setConfirmEnd(false); }}><DialogTitle>End match?</DialogTitle><DialogContent>The current score will become the final result and the points table will update automatically.</DialogContent><DialogActions><Button disabled={busy} onClick={() => setConfirmEnd(false)}>Keep live</Button><Button disabled={busy} color="error" variant="contained" onClick={() => { setConfirmEnd(false); matchAction('end'); }}>Confirm final result</Button></DialogActions></Dialog>
  </Stack>;
}
