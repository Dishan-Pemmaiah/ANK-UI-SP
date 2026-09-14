import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import HockeyMatchCard from '../../components/HockeyMatchCard';

export default function HockeyMatchControl({ matches, players, selectedMatch, selectMatch, scorers, setScorers, busy, matchAction, correct, setCorrect, saveCorrection, confirmEnd, setConfirmEnd }) {
  const teamPlayers = (teamId) => players.filter((player) => player.team_id === teamId);
  return <Stack spacing={2}>
    <TextField select fullWidth size="small" label="Select match" value={selectedMatch?.id || ''} onChange={(event) => selectMatch(matches.find((match) => match.id === event.target.value))}>
      <MenuItem value="">Choose a match</MenuItem>
      {matches.map((match) => <MenuItem key={match.id} value={match.id}>{match.home?.name} vs {match.away?.name} · {match.status}</MenuItem>)}
    </TextField>
    {selectedMatch && <>
      <HockeyMatchCard match={selectedMatch} />
      {selectedMatch.status === 'Upcoming' && <Button fullWidth size="large" variant="contained" disabled={busy} onClick={() => matchAction('start')} sx={{ py: 2, fontWeight: 900 }}>START MATCH</Button>}
      {selectedMatch.status === 'Live' && <Paper sx={{ p: { xs: 1.5, sm: 2 }, position: 'sticky', bottom: 8, zIndex: 2, border: '1px solid #a33', boxShadow: '0 10px 35px #000' }}>
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
          <Button fullWidth variant="contained" disabled={busy} onClick={() => matchAction(`${side}_goal`, team.id, scorers[side])} sx={{ minHeight: 74, fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>{team.name} + Goal</Button>
          <Button fullWidth variant="text" color="inherit" disabled={busy || selectedMatch[`${side}_score`] === 0} onClick={() => matchAction(`${side}_undo`, team.id)} sx={{ mt: 0.5, minHeight: 44, color: '#aaa' }}>Undo {team.name} goal</Button>
        </Grid>)}</Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {selectedMatch.phase === '1st Half' && <Button fullWidth variant="outlined" disabled={busy} onClick={() => matchAction('phase_half')}>Half Time</Button>}
          {selectedMatch.phase === 'Half Time' && <Button fullWidth variant="outlined" disabled={busy} onClick={() => matchAction('phase_second')}>Start 2nd Half</Button>}
        </Stack>
        <Box sx={{ borderTop: '1px solid #555', mt: 2, pt: 2 }}><Button fullWidth color="error" variant="contained" disabled={busy} onClick={() => setConfirmEnd(true)} sx={{ minHeight: 58, fontWeight: 900 }}>END MATCH</Button></Box>
      </Paper>}
      {['Upcoming', 'Live'].includes(selectedMatch.status) && <Stack direction="row" spacing={1}><Button disabled={busy} onClick={() => { if (window.confirm('Postpone this match?')) matchAction('postpone'); }}>Postpone</Button><Button disabled={busy} color="error" onClick={() => { if (window.confirm('Cancel this match?')) matchAction('cancel'); }}>Cancel</Button></Stack>}
      {selectedMatch.status === 'Completed' && <Paper sx={{ p: 2 }}><Typography variant="h6">Correct final result</Typography><Stack direction="row" spacing={1} sx={{ mt: 2 }}><TextField fullWidth size="small" type="number" label={selectedMatch.home?.name} value={correct.home} onChange={(event) => setCorrect({ ...correct, home: event.target.value })} inputProps={{ min: 0 }} /><TextField fullWidth size="small" type="number" label={selectedMatch.away?.name} value={correct.away} onChange={(event) => setCorrect({ ...correct, away: event.target.value })} inputProps={{ min: 0 }} /></Stack><Button sx={{ mt: 2 }} disabled={busy || correct.home === '' || correct.away === '' || Number(correct.home) < 0 || Number(correct.away) < 0} onClick={saveCorrection}>Save correction</Button></Paper>}
    </>}
    <Dialog open={confirmEnd} onClose={() => { if (!busy) setConfirmEnd(false); }}><DialogTitle>End match?</DialogTitle><DialogContent>The current score will become the final result and the points table will update automatically.</DialogContent><DialogActions><Button disabled={busy} onClick={() => setConfirmEnd(false)}>Keep live</Button><Button disabled={busy} color="error" variant="contained" onClick={() => { setConfirmEnd(false); matchAction('end'); }}>Confirm final result</Button></DialogActions></Dialog>
  </Stack>;
}
