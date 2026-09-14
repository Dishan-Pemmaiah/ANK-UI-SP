import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useParams, useSearchParams } from 'react-router-dom';
import HockeyMatchCard from '../../components/HockeyMatchCard';
import HockeyMatchControl from './HockeyMatchControl';
import { controlMatch, correctGoal, correctResult, deleteAnnouncement, deleteMatch, deletePlayer, deleteTeam, getSeasonData, saveAnnouncement, saveMatch, savePlayer, saveSeason, saveTeam } from '../../services/hockeyService';
import { istDateToIso, istLocalDateTimeToIso, toIstDate, toIstLocalDateTime } from '../../services/hockeyDates';

const blankTeam = { name: '', pool: '', logo_url: '' };
const blankPlayer = { team_id: '', name: '', shirt_number: '' };
const blankMatch = { home_team_id: '', away_team_id: '', scheduled_at: '', venue: '', pool: '', stage: 'Group', round_label: '' };

export default function AdminAnjk3() {
  const { slug: seasonSlug = 'anjk-3' } = useParams();
  const [searchParams] = useSearchParams();
  const requestedMatchRef = useRef(searchParams.get('match'));
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(searchParams.get('tab') === 'match-control' ? 'Match Control' : 'Tournament');
  const [seasonForm, setSeasonForm] = useState(null);
  const [teamForm, setTeamForm] = useState(blankTeam);
  const [playerForm, setPlayerForm] = useState(blankPlayer);
  const [matchForm, setMatchForm] = useState(blankMatch);
  const fixtureDateRef = useRef(null);
  const fixtureTimeRef = useRef(null);
  const [matchToDelete, setMatchToDelete] = useState(null);
  const [announcement, setAnnouncement] = useState(/** @type {{id?: string, title: string, body: string, is_published: boolean}} */ ({ title: '', body: '', is_published: true }));
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [correct, setCorrect] = useState({ home: 0, away: 0 });
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [scorers, setScorers] = useState({ home: '', away: '' });
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const next = await getSeasonData(seasonSlug, true); setData(next);
    setSeasonForm((prev) => prev || (next.season ? { ...next.season, starts_at: toIstDate(next.season.starts_at), ends_at: toIstDate(next.season.ends_at) } : { slug: seasonSlug, name: seasonSlug.toUpperCase().replace('-', ' '), description: '', venue: '', starts_at: '', ends_at: '', poster_url: '', win_points: 3, draw_points: 1, loss_points: 0 }));
    setSelectedMatch((prev) => prev ? next.matches.find((match) => match.id === prev.id) || null : null);
    if (requestedMatchRef.current) {
      const requested = next.matches.find((match) => match.id === requestedMatchRef.current);
      if (requested) { setSelectedMatch(requested); setCorrect({ home: requested.home_score, away: requested.away_score }); }
      requestedMatchRef.current = null;
    }
  }, [seasonSlug]);
  useEffect(() => { load().catch((err) => setError(err.message)); const timer = setInterval(() => load().catch(() => {}), 12000); return () => clearInterval(timer); }, [load]);
  const run = async (work, success) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true); setError(''); setMessage('');
    try { await work(); await load(); setMessage(success); return true; } catch (err) { setError(err.message); return false; } finally { busyRef.current = false; setBusy(false); }
  };
  const season = data?.season;
  const setSeasonField = (name, value) => setSeasonForm((prev) => ({ ...prev, [name]: value }));
  const setFixtureDatePart = (part, value) => setMatchForm((prev) => {
    const [date = '', time = ''] = prev.scheduled_at.split('T');
    const nextDate = part === 'date' ? value : date;
    const nextTime = part === 'time' ? value : time;
    return { ...prev, scheduled_at: nextDate || nextTime ? `${nextDate}T${nextTime}` : '' };
  });
  const openPicker = (ref) => {
    const input = ref.current;
    if (!input) return;
    try { if (typeof input.showPicker === 'function') input.showPicker(); else input.focus(); }
    catch { input.focus(); }
  };
  const confirmDeleteMatch = async () => {
    const target = matchToDelete;
    if (!target) return;
    const deleted = await run(async () => {
      await deleteMatch(target.id);
      if (selectedMatch?.id === target.id) setSelectedMatch(null);
      if (matchForm.id === target.id) setMatchForm(blankMatch);
    }, 'Match deleted. Its goals and result were removed from the tournament.');
    if (deleted) setMatchToDelete(null);
  };
  const saveSeasonForm = () => run(async () => {
    if (seasonForm.starts_at && seasonForm.ends_at && seasonForm.ends_at < seasonForm.starts_at) throw new Error('End date must be on or after start date.');
    const saved = await saveSeason({ slug: seasonForm.slug.trim(), name: seasonForm.name.trim(), description: seasonForm.description || '', venue: seasonForm.venue || '', starts_at: istDateToIso(seasonForm.starts_at), ends_at: istDateToIso(seasonForm.ends_at, true), poster_url: seasonForm.poster_url || '', champion_team_id: seasonForm.champion_team_id || null, win_points: Number(seasonForm.win_points), draw_points: Number(seasonForm.draw_points), loss_points: Number(seasonForm.loss_points) }, season?.id);
    setSeasonForm({ ...saved, starts_at: toIstDate(saved.starts_at), ends_at: toIstDate(saved.ends_at) });
  }, 'Tournament saved.');
  const saveTeamForm = () => run(async () => { await saveTeam({ season_id: season.id, name: teamForm.name.trim(), pool: teamForm.pool.trim(), logo_url: teamForm.logo_url.trim() }, teamForm.id); setTeamForm(blankTeam); }, 'Team saved.');
  const savePlayerForm = () => run(async () => { await savePlayer({ season_id: season.id, team_id: playerForm.team_id, name: playerForm.name.trim(), shirt_number: playerForm.shirt_number === '' ? null : Number(playerForm.shirt_number) }, playerForm.id); setPlayerForm(blankPlayer); }, 'Player saved.');
  const saveMatchForm = () => run(async () => { await saveMatch({ season_id: season.id, home_team_id: matchForm.home_team_id, away_team_id: matchForm.away_team_id, scheduled_at: istLocalDateTimeToIso(matchForm.scheduled_at), venue: matchForm.venue, pool: matchForm.pool, stage: matchForm.stage, round_label: matchForm.round_label, ...(matchForm.status === 'Postponed' ? { status: 'Upcoming', home_score: 0, away_score: 0, started_at: null, completed_at: null } : {}) }, matchForm.id); setMatchForm(blankMatch); }, 'Fixture saved.');
  const matchAction = async (action, teamId, playerId) => {
    const saved = await run(async () => { const updated = await controlMatch(selectedMatch.id, action, teamId, playerId || null); setCorrect({ home: updated.home_score, away: updated.away_score }); }, 'Match updated.');
    if (saved && action.endsWith('_goal')) setScorers((prev) => ({ ...prev, [action.startsWith('home') ? 'home' : 'away']: '' }));
  };
  const selectMatch = (match) => { setSelectedMatch(match); if (match) setCorrect({ home: match.home_score, away: match.away_score }); };
  const field = (label, value, onChange, props = {}) => <TextField fullWidth size="small" label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value)} {...props} />;
  return <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 8 }}>
    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{season?.name || 'Hockey'} CMS</Typography>
    <Typography sx={{ color: '#aaa', mb: 2 }}>Manage the season, pools, fixtures, announcements and live scoring.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>{['Tournament','Teams','Players','Fixtures','Match Control','Announcements'].map((item) => <Tab value={item} label={item} key={item} />)}</Tabs>
    {tab === 'Tournament' && seasonForm && <Paper sx={{ p: 2.5 }}><Grid container spacing={2}>
      <Grid item xs={12} sm={6}>{field('Season name', seasonForm.name, (v) => setSeasonField('name', v))}</Grid><Grid item xs={12} sm={6}>{field('Slug', seasonForm.slug, (v) => setSeasonField('slug', v), { disabled: Boolean(season?.id) })}</Grid>
      <Grid item xs={12}>{field('Description', seasonForm.description, (v) => setSeasonField('description', v), { multiline: true, rows: 3 })}</Grid>
      <Grid item xs={12} sm={6}>{field('Venue', seasonForm.venue, (v) => setSeasonField('venue', v))}</Grid><Grid item xs={12} sm={6}>{field('Poster image URL', seasonForm.poster_url, (v) => setSeasonField('poster_url', v))}</Grid>
      <Grid item xs={12} sm={6}>{field('Starts', seasonForm.starts_at, (v) => setSeasonField('starts_at', v), { type: 'date', InputLabelProps: { shrink: true } })}</Grid><Grid item xs={12} sm={6}>{field('Ends', seasonForm.ends_at, (v) => setSeasonField('ends_at', v), { type: 'date', InputLabelProps: { shrink: true } })}</Grid>
      {['win_points','draw_points','loss_points'].map((key) => <Grid item xs={4} key={key}>{field(key.replace('_',' '), seasonForm[key], (v) => setSeasonField(key,v), { type: 'number' })}</Grid>)}
      <Grid item xs={12}><TextField fullWidth select size="small" label="Champion" value={seasonForm.champion_team_id || ''} onChange={(e) => setSeasonField('champion_team_id', e.target.value)}><MenuItem value="">Not decided</MenuItem>{data?.teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12}><Button disabled={busy || !seasonForm.name.trim()} onClick={saveSeasonForm} variant="contained">Save tournament</Button></Grid>
    </Grid></Paper>}
    {tab === 'Teams' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>{teamForm.id ? 'Edit team' : 'Add team'}</Typography><Stack spacing={2}>{field('Team name',teamForm.name,(v) => setTeamForm({ ...teamForm, name:v }))}{field('Pool / group',teamForm.pool,(v) => setTeamForm({ ...teamForm, pool:v }))}{field('Logo URL',teamForm.logo_url,(v) => setTeamForm({ ...teamForm, logo_url:v }))}<Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || !season || !teamForm.name.trim()} onClick={saveTeamForm}>Save team</Button>{teamForm.id && <Button onClick={() => setTeamForm(blankTeam)}>Cancel edit</Button>}</Stack></Stack></Paper>{data?.teams.map((team) => <Paper key={team.id} sx={{ p: 2 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={800}>{team.name}</Typography><Typography color="text.secondary">{team.pool ? `Pool ${team.pool}` : 'League'}</Typography></Box><Stack direction="row"><Button onClick={() => setTeamForm(team)}>Edit</Button><Button color="error" onClick={() => { if (window.confirm(`Delete ${team.name}? Teams used in fixtures cannot be deleted.`)) run(() => deleteTeam(team.id), 'Team deleted.'); }}>Delete</Button></Stack></Stack></Paper>)}</Stack>}
    {tab === 'Players' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>{playerForm.id ? 'Edit player' : 'Add player'}</Typography><Stack spacing={2}><TextField fullWidth select size="small" label="Team" value={playerForm.team_id} onChange={(e) => setPlayerForm({ ...playerForm, team_id: e.target.value })}><MenuItem value="">Select team</MenuItem>{data?.teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField>{field('Player name', playerForm.name, (v) => setPlayerForm({ ...playerForm, name: v }))}{field('Jersey number', playerForm.shirt_number, (v) => setPlayerForm({ ...playerForm, shirt_number: v }), { type: 'number', inputProps: { min: 0, max: 99 } })}<Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || !season || !playerForm.team_id || !playerForm.name.trim() || (playerForm.shirt_number !== '' && (Number(playerForm.shirt_number) < 0 || Number(playerForm.shirt_number) > 99))} onClick={savePlayerForm}>Save player</Button>{playerForm.id && <Button onClick={() => setPlayerForm(blankPlayer)}>Cancel edit</Button>}</Stack></Stack></Paper>{data?.teams.map((team) => <Paper key={team.id} sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 1 }}>{team.name}</Typography>{data.players.filter((player) => player.team_id === team.id).map((player) => <Stack key={player.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}><Typography>{player.shirt_number === null ? '—' : `#${player.shirt_number}`} · {player.name}</Typography><Stack direction="row"><Button onClick={() => setPlayerForm(player)}>Edit</Button><Button color="error" onClick={() => { if (window.confirm(`Delete ${player.name}?`)) run(() => deletePlayer(player.id), 'Player deleted.'); }}>Delete</Button></Stack></Stack>)}</Paper>)}</Stack>}
    {tab === 'Fixtures' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>{matchForm.id ? 'Edit / reschedule fixture' : 'Create fixture'}</Typography><Grid container spacing={2}>
      {['home_team_id','away_team_id'].map((key) => <Grid item xs={12} sm={6} key={key}><TextField fullWidth select size="small" label={key === 'home_team_id' ? 'Team A' : 'Team B'} value={matchForm[key]} onChange={(e) => setMatchForm({ ...matchForm, [key]: e.target.value })}><MenuItem value="">Select team</MenuItem>{data?.teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField></Grid>)}
      <Grid item xs={12}><Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <TextField fullWidth size="small" type="date" label="Fixture date" InputLabelProps={{ shrink: true }} inputRef={fixtureDateRef} value={matchForm.scheduled_at.split('T')[0] || ''} onChange={(event) => setFixtureDatePart('date', event.target.value)} sx={{ '& input': { colorScheme: 'dark' }, '& input::-webkit-calendar-picker-indicator': { filter: 'brightness(0) invert(1)', opacity: 1, cursor: 'pointer' } }} />
        <Button variant="outlined" color="inherit" startIcon={<CalendarMonthIcon />} onClick={() => openPicker(fixtureDateRef)} aria-label="Open fixture calendar" sx={{ minHeight: 40, whiteSpace: 'nowrap' }}>Calendar</Button>
        <TextField fullWidth size="small" type="time" label="Start time (IST)" InputLabelProps={{ shrink: true }} inputRef={fixtureTimeRef} value={matchForm.scheduled_at.split('T')[1] || ''} onChange={(event) => setFixtureDatePart('time', event.target.value)} inputProps={{ step: 60 }} sx={{ '& input': { colorScheme: 'dark' }, '& input::-webkit-calendar-picker-indicator': { filter: 'brightness(0) invert(1)', opacity: 1, cursor: 'pointer' } }} />
        <Button variant="outlined" color="inherit" startIcon={<AccessTimeIcon />} onClick={() => openPicker(fixtureTimeRef)} aria-label="Open fixture time picker" sx={{ minHeight: 40, whiteSpace: 'nowrap' }}>Time</Button>
      </Stack><Typography variant="caption" color="text.secondary">Choose the match date and start time in Indian Standard Time.</Typography></Grid>
      <Grid item xs={12} sm={6}>{field('Venue',matchForm.venue,(v) => setMatchForm({ ...matchForm, venue:v }))}</Grid>
      <Grid item xs={12} sm={6}>{field('Pool',matchForm.pool,(v) => setMatchForm({ ...matchForm, pool:v }))}</Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth select size="small" label="Stage" value={matchForm.stage} onChange={(e) => setMatchForm({ ...matchForm, stage:e.target.value })}>{['Group','League','Quarter Final','Semi Final','Final'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12}>{field('Round / match label',matchForm.round_label,(v) => setMatchForm({ ...matchForm, round_label:v }))}</Grid>
      <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || !season || !matchForm.home_team_id || !matchForm.away_team_id || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(matchForm.scheduled_at) || matchForm.home_team_id === matchForm.away_team_id} onClick={saveMatchForm}>Save fixture</Button>{matchForm.id && <Button onClick={() => setMatchForm(blankMatch)}>Cancel edit</Button>}</Stack></Grid>
    </Grid></Paper>{data?.matches.map((match) => <Box key={match.id}><HockeyMatchCard match={match} compact /><Stack direction="row" spacing={1} sx={{ mt: 0.5 }}><Button size="small" onClick={() => setMatchForm({ ...match, scheduled_at: toIstLocalDateTime(match.scheduled_at) })} disabled={['Live','Completed','Cancelled'].includes(match.status)}>Edit / reschedule</Button><Button size="small" onClick={() => { selectMatch(match); setTab('Match Control'); }}>Control</Button><Button size="small" color="error" disabled={busy} onClick={() => setMatchToDelete(match)}>Delete match</Button></Stack></Box>)}</Stack>}
    {tab === 'Match Control' && <HockeyMatchControl matches={data?.matches || []} players={data?.players || []} events={data?.events || []} selectedMatch={selectedMatch} selectMatch={selectMatch} scorers={scorers} setScorers={setScorers} busy={busy} matchAction={matchAction} correct={correct} setCorrect={setCorrect} saveCorrection={() => run(() => correctResult(selectedMatch.id, correct.home, correct.away), 'Result corrected; standings updated.')} saveGoalCorrection={(action, goalId, teamId, playerId) => run(async () => { const updated = await correctGoal(selectedMatch.id, action, goalId, teamId, playerId); setCorrect({ home: updated.home_score, away: updated.away_score }); }, 'Goal correction saved; score and scorer credit updated.')} requestDeleteMatch={setMatchToDelete} confirmEnd={confirmEnd} setConfirmEnd={setConfirmEnd} />}
    {tab === 'Announcements' && <Stack spacing={2}><Paper sx={{ p: 2 }}><Stack spacing={2}>{field('Title',announcement.title,(v) => setAnnouncement({ ...announcement,title:v }))}{field('Message',announcement.body,(v) => setAnnouncement({ ...announcement,body:v }),{ multiline:true,rows:3 })}<TextField fullWidth select size="small" label="Visibility" value={announcement.is_published ? 'published' : 'draft'} onChange={(e) => setAnnouncement({ ...announcement, is_published: e.target.value === 'published' })}><MenuItem value="published">Published</MenuItem><MenuItem value="draft">Draft</MenuItem></TextField><Stack direction="row" spacing={1}><Button variant="contained" disabled={busy || !season || !announcement.title.trim()} onClick={() => run(async () => { await saveAnnouncement({ season_id:season.id,title:announcement.title.trim(),body:announcement.body,is_published:announcement.is_published },announcement.id); setAnnouncement({ title:'',body:'',is_published:true }); },'Announcement saved.')}>Save announcement</Button>{announcement.id && <Button onClick={() => setAnnouncement({ title:'',body:'',is_published:true })}>Cancel edit</Button>}</Stack></Stack></Paper>{data?.announcements.map((item) => <Paper key={item.id} sx={{ p: 2 }}><Stack direction="row" justifyContent="space-between"><Typography fontWeight={800}>{item.title}</Typography><Typography variant="caption" sx={{ color: item.is_published ? '#8fddab' : '#aaa' }}>{item.is_published ? 'Published' : 'Draft'}</Typography></Stack><Typography>{item.body}</Typography><Divider sx={{ my: 1 }} /><Button onClick={() => setAnnouncement(item)}>Edit</Button><Button color="error" onClick={() => { if (window.confirm('Delete announcement?')) run(() => deleteAnnouncement(item.id),'Announcement deleted.'); }}>Delete</Button></Paper>)}</Stack>}
    <Dialog open={Boolean(matchToDelete)} onClose={() => { if (!busy) setMatchToDelete(null); }} fullWidth maxWidth="xs">
      <DialogTitle>Delete match?</DialogTitle>
      <DialogContent><Typography>{matchToDelete?.home?.name} vs {matchToDelete?.away?.name} · {matchToDelete?.status}</Typography><Typography sx={{ mt: 1 }} color="text.secondary">This permanently removes the fixture, its goals and match history. A completed result will also disappear from standings and stats.</Typography></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setMatchToDelete(null)}>Keep match</Button><Button disabled={busy} color="error" variant="contained" onClick={confirmDeleteMatch}>Delete match permanently</Button></DialogActions>
    </Dialog>
  </Box>;
}
