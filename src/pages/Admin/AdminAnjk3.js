import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import HockeyMatchCard from '../../components/HockeyMatchCard';
import { controlMatch, correctResult, deleteAnnouncement, deleteTeam, getSeasonData, saveAnnouncement, saveMatch, saveSeason, saveTeam } from '../../services/hockeyService';

const blankTeam = { name: '', pool: '', logo_url: '' };
const blankMatch = { home_team_id: '', away_team_id: '', scheduled_at: '', venue: '', pool: '', stage: 'Group', round_label: '' };
const dateInput = (value) => value ? (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? value : new Date(value).toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T').slice(0,16)) : '';
const istTimestamp = (value) => value ? new Date(`${dateInput(value)}:00+05:30`).toISOString() : null;

export default function AdminAnjk3() {
  const { slug: seasonSlug = 'anjk-3' } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('Tournament');
  const [seasonForm, setSeasonForm] = useState(null);
  const [teamForm, setTeamForm] = useState(blankTeam);
  const [matchForm, setMatchForm] = useState(blankMatch);
  const [announcement, setAnnouncement] = useState(/** @type {{id?: string, title: string, body: string, is_published: boolean}} */ ({ title: '', body: '', is_published: true }));
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [correct, setCorrect] = useState({ home: 0, away: 0 });
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const next = await getSeasonData(seasonSlug); setData(next);
    setSeasonForm((prev) => prev || next.season || { slug: seasonSlug, name: seasonSlug.toUpperCase().replace('-', ' '), description: '', venue: '', starts_at: '', ends_at: '', poster_url: '', win_points: 3, draw_points: 1, loss_points: 0 });
    setSelectedMatch((prev) => prev ? next.matches.find((match) => match.id === prev.id) || null : null);
  }, [seasonSlug]);
  useEffect(() => { load().catch((err) => setError(err.message)); const timer = setInterval(() => load().catch(() => {}), 12000); return () => clearInterval(timer); }, [load]);
  const run = async (work, success) => {
    setBusy(true); setError(''); setMessage('');
    try { await work(); await load(); setMessage(success); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const season = data?.season;
  const setSeasonField = (name, value) => setSeasonForm((prev) => ({ ...prev, [name]: value }));
  const saveSeasonForm = () => run(() => saveSeason({ slug: seasonForm.slug.trim(), name: seasonForm.name.trim(), description: seasonForm.description || '', venue: seasonForm.venue || '', starts_at: istTimestamp(seasonForm.starts_at), ends_at: istTimestamp(seasonForm.ends_at), poster_url: seasonForm.poster_url || '', champion_team_id: seasonForm.champion_team_id || null, win_points: Number(seasonForm.win_points), draw_points: Number(seasonForm.draw_points), loss_points: Number(seasonForm.loss_points) }, season?.id), 'Tournament saved.');
  const saveTeamForm = () => run(async () => { await saveTeam({ season_id: season.id, name: teamForm.name.trim(), pool: teamForm.pool.trim(), logo_url: teamForm.logo_url.trim() }, teamForm.id); setTeamForm(blankTeam); }, 'Team saved.');
  const saveMatchForm = () => run(async () => { await saveMatch({ season_id: season.id, home_team_id: matchForm.home_team_id, away_team_id: matchForm.away_team_id, scheduled_at: istTimestamp(matchForm.scheduled_at), venue: matchForm.venue, pool: matchForm.pool, stage: matchForm.stage, round_label: matchForm.round_label, ...(matchForm.status === 'Postponed' ? { status: 'Upcoming', home_score: 0, away_score: 0, started_at: null, completed_at: null } : {}) }, matchForm.id); setMatchForm(blankMatch); }, 'Fixture saved.');
  const matchAction = (action, teamId) => run(() => controlMatch(selectedMatch.id, action, teamId), 'Match updated.');
  const selectMatch = (match) => { setSelectedMatch(match); if (match) setCorrect({ home: match.home_score, away: match.away_score }); };
  const field = (label, value, onChange, props = {}) => <TextField fullWidth size="small" label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value)} {...props} />;
  return <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 8 }}>
    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{season?.name || 'Hockey'} CMS</Typography>
    <Typography sx={{ color: '#aaa', mb: 2 }}>Manage the season, pools, fixtures, announcements and live scoring.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>{['Tournament','Teams','Fixtures','Match Control','Announcements'].map((item) => <Tab value={item} label={item} key={item} />)}</Tabs>
    {tab === 'Tournament' && seasonForm && <Paper sx={{ p: 2.5 }}><Grid container spacing={2}>
      <Grid item xs={12} sm={6}>{field('Season name', seasonForm.name, (v) => setSeasonField('name', v))}</Grid><Grid item xs={12} sm={6}>{field('Slug', seasonForm.slug, (v) => setSeasonField('slug', v), { disabled: Boolean(season?.id) })}</Grid>
      <Grid item xs={12}>{field('Description', seasonForm.description, (v) => setSeasonField('description', v), { multiline: true, rows: 3 })}</Grid>
      <Grid item xs={12} sm={6}>{field('Venue', seasonForm.venue, (v) => setSeasonField('venue', v))}</Grid><Grid item xs={12} sm={6}>{field('Poster image URL', seasonForm.poster_url, (v) => setSeasonField('poster_url', v))}</Grid>
      <Grid item xs={12} sm={6}>{field('Starts', dateInput(seasonForm.starts_at), (v) => setSeasonField('starts_at', v), { type: 'datetime-local', InputLabelProps: { shrink: true } })}</Grid><Grid item xs={12} sm={6}>{field('Ends', dateInput(seasonForm.ends_at), (v) => setSeasonField('ends_at', v), { type: 'datetime-local', InputLabelProps: { shrink: true } })}</Grid>
      {['win_points','draw_points','loss_points'].map((key) => <Grid item xs={4} key={key}>{field(key.replace('_',' '), seasonForm[key], (v) => setSeasonField(key,v), { type: 'number' })}</Grid>)}
      <Grid item xs={12}><TextField fullWidth select size="small" label="Champion" value={seasonForm.champion_team_id || ''} onChange={(e) => setSeasonField('champion_team_id', e.target.value)}><MenuItem value="">Not decided</MenuItem>{data?.teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12}><Button disabled={busy || !seasonForm.name.trim()} onClick={saveSeasonForm} variant="contained">Save tournament</Button></Grid>
    </Grid></Paper>}
    {tab === 'Teams' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>{teamForm.id ? 'Edit team' : 'Add team'}</Typography><Stack spacing={2}>{field('Team name',teamForm.name,(v) => setTeamForm({ ...teamForm, name:v }))}{field('Pool / group',teamForm.pool,(v) => setTeamForm({ ...teamForm, pool:v }))}{field('Logo URL',teamForm.logo_url,(v) => setTeamForm({ ...teamForm, logo_url:v }))}<Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || !season || !teamForm.name.trim()} onClick={saveTeamForm}>Save team</Button>{teamForm.id && <Button onClick={() => setTeamForm(blankTeam)}>Cancel edit</Button>}</Stack></Stack></Paper>{data?.teams.map((team) => <Paper key={team.id} sx={{ p: 2 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={800}>{team.name}</Typography><Typography color="text.secondary">{team.pool ? `Pool ${team.pool}` : 'League'}</Typography></Box><Stack direction="row"><Button onClick={() => setTeamForm(team)}>Edit</Button><Button color="error" onClick={() => { if (window.confirm(`Delete ${team.name}? Teams used in fixtures cannot be deleted.`)) run(() => deleteTeam(team.id), 'Team deleted.'); }}>Delete</Button></Stack></Stack></Paper>)}</Stack>}
    {tab === 'Fixtures' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>{matchForm.id ? 'Edit / reschedule fixture' : 'Create fixture'}</Typography><Grid container spacing={2}>
      {['home_team_id','away_team_id'].map((key) => <Grid item xs={12} sm={6} key={key}><TextField fullWidth select size="small" label={key === 'home_team_id' ? 'Team A' : 'Team B'} value={matchForm[key]} onChange={(e) => setMatchForm({ ...matchForm, [key]: e.target.value })}><MenuItem value="">Select team</MenuItem>{data?.teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField></Grid>)}
      <Grid item xs={12} sm={6}>{field('Date and time',dateInput(matchForm.scheduled_at),(v) => setMatchForm({ ...matchForm, scheduled_at:v }),{ type:'datetime-local', InputLabelProps:{ shrink:true } })}</Grid>
      <Grid item xs={12} sm={6}>{field('Venue',matchForm.venue,(v) => setMatchForm({ ...matchForm, venue:v }))}</Grid>
      <Grid item xs={12} sm={6}>{field('Pool',matchForm.pool,(v) => setMatchForm({ ...matchForm, pool:v }))}</Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth select size="small" label="Stage" value={matchForm.stage} onChange={(e) => setMatchForm({ ...matchForm, stage:e.target.value })}>{['Group','League','Quarter Final','Semi Final','Final'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12}>{field('Round / match label',matchForm.round_label,(v) => setMatchForm({ ...matchForm, round_label:v }))}</Grid>
      <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || !season || !matchForm.home_team_id || !matchForm.away_team_id || !matchForm.scheduled_at || matchForm.home_team_id === matchForm.away_team_id} onClick={saveMatchForm}>Save fixture</Button>{matchForm.id && <Button onClick={() => setMatchForm(blankMatch)}>Cancel edit</Button>}</Stack></Grid>
    </Grid></Paper>{data?.matches.map((match) => <Box key={match.id}><HockeyMatchCard match={match} compact /><Stack direction="row" spacing={1} sx={{ mt: 0.5 }}><Button size="small" onClick={() => setMatchForm(match)} disabled={['Live','Completed','Cancelled'].includes(match.status)}>Edit / reschedule</Button><Button size="small" onClick={() => { selectMatch(match); setTab('Match Control'); }}>Control</Button></Stack></Box>)}</Stack>}
    {tab === 'Match Control' && <Stack spacing={2}><TextField select fullWidth size="small" label="Select match" value={selectedMatch?.id || ''} onChange={(e) => selectMatch(data.matches.find((match) => match.id === e.target.value))}><MenuItem value="">Choose a match</MenuItem>{data?.matches.map((match) => <MenuItem key={match.id} value={match.id}>{match.home?.name} vs {match.away?.name} · {match.status}</MenuItem>)}</TextField>{selectedMatch && <><HockeyMatchCard match={selectedMatch} />
      {selectedMatch.status === 'Upcoming' && <Button fullWidth size="large" variant="contained" disabled={busy} onClick={() => matchAction('start')} sx={{ py: 2, fontWeight: 900 }}>START MATCH</Button>}
      {selectedMatch.status === 'Live' && <Paper sx={{ p: 2, position: 'sticky', bottom: 8, zIndex: 2, border: '1px solid #a33' }}><Grid container spacing={1}>{[['home_goal',selectedMatch.home,'+ Goal'],['home_undo',selectedMatch.home,'− Goal'],['away_goal',selectedMatch.away,'+ Goal'],['away_undo',selectedMatch.away,'− Goal']].map(([action,team,label]) => <Grid item xs={6} key={action}><Button fullWidth variant={action.includes('goal') ? 'contained' : 'outlined'} disabled={busy} onClick={() => matchAction(action,team.id)} sx={{ minHeight: 58 }}>{team.name} {label}</Button></Grid>)}</Grid><Button fullWidth color="error" variant="contained" disabled={busy} onClick={() => setConfirmEnd(true)} sx={{ mt: 2, minHeight: 58, fontWeight: 900 }}>END MATCH</Button></Paper>}
      {['Upcoming','Live'].includes(selectedMatch.status) && <Stack direction="row" spacing={1}><Button disabled={busy} onClick={() => { if (window.confirm('Postpone this match?')) matchAction('postpone'); }}>Postpone</Button><Button disabled={busy} color="error" onClick={() => { if (window.confirm('Cancel this match?')) matchAction('cancel'); }}>Cancel</Button></Stack>}
      {selectedMatch.status === 'Completed' && <Paper sx={{ p: 2 }}><Typography variant="h6">Correct final result</Typography><Stack direction="row" spacing={1} sx={{ mt: 2 }}>{field(selectedMatch.home?.name,correct.home,(v) => setCorrect({ ...correct, home:v }),{ type:'number' })}{field(selectedMatch.away?.name,correct.away,(v) => setCorrect({ ...correct, away:v }),{ type:'number' })}</Stack><Button sx={{ mt: 2 }} disabled={busy || correct.home < 0 || correct.away < 0} onClick={() => run(() => correctResult(selectedMatch.id,correct.home,correct.away),'Result corrected; standings updated.')}>Save correction</Button></Paper>}
    </>}</Stack>}
    {tab === 'Announcements' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Stack spacing={2}>{field('Title',announcement.title,(v) => setAnnouncement({ ...announcement,title:v }))}{field('Message',announcement.body,(v) => setAnnouncement({ ...announcement,body:v }),{ multiline:true,rows:3 })}<Button variant="contained" disabled={busy || !season || !announcement.title.trim()} onClick={() => run(async () => { await saveAnnouncement({ season_id:season.id,title:announcement.title.trim(),body:announcement.body,is_published:true },announcement.id); setAnnouncement({ title:'',body:'',is_published:true }); },'Announcement saved.')}>Publish announcement</Button></Stack></Paper>{data?.announcements.map((item) => <Paper key={item.id} sx={{ p: 2 }}><Typography fontWeight={800}>{item.title}</Typography><Typography>{item.body}</Typography><Divider sx={{ my: 1 }} /><Button onClick={() => setAnnouncement(item)}>Edit</Button><Button color="error" onClick={() => { if (window.confirm('Delete announcement?')) run(() => deleteAnnouncement(item.id),'Announcement deleted.'); }}>Delete</Button></Paper>)}</Stack>}
    <Dialog open={confirmEnd} onClose={() => setConfirmEnd(false)}><DialogTitle>End match?</DialogTitle><DialogContent>The current score will become the final result and the points table will update automatically.</DialogContent><DialogActions><Button onClick={() => setConfirmEnd(false)}>Keep live</Button><Button color="error" variant="contained" onClick={() => { setConfirmEnd(false); matchAction('end'); }}>Confirm final result</Button></DialogActions></Dialog>
  </Box>;
}
