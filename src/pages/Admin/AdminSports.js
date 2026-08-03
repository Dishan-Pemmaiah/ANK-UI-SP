import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import sportsApi from '../../services/sportsService';

const SPORTS = ['Cricket', 'Football', 'Hockey', 'Kho-Kho', 'Kabaddi', 'Marathon', 'Other'];

const SECTION_LINKS = [
  { key: 'overview', label: 'Overview', path: '/admin/sports' },
  { key: 'hosted', label: 'Hosted Desk', path: '/admin/sports/hosted' },
  { key: 'external', label: 'Playing Other', path: '/admin/sports/external' },
  { key: 'live', label: 'Live Desk', path: '/admin/sports/live' },
  { key: 'fixtures', label: 'Fixtures', path: '/admin/sports/fixtures' },
  { key: 'history', label: 'History', path: '/admin/sports/history' }
];

const emptyPointsRow = { team: '', played: '', won: '', lost: '', points: '', nrr: '' };

const emptyTournament = {
  tournamentName: '',
  sportName: 'Cricket',
  tournamentType: 'Hosted',
  hostedBy: '',
  year: new Date().getFullYear(),
  venue: '',
  description: '',
  result: '',
  images: [],
  currentTournament: '',
  fixtureLabel: '',
  teamA: '',
  teamB: '',
  playing11: '',
  players: [],
  hostedFixtures: '',
  pointsTable: '',
  pointsTableRows: [],
  otherStats: '',
  matchSchedule: '',
  teamDetails: '',
  registrationLink: '',
  liveLink: '',
  status: 'Upcoming',
  sortOrder: 0
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read image file.'));
  reader.readAsDataURL(file);
});

const parsePlayers = (item) => {
  if (Array.isArray(item?.players) && item.players.length) {
    return item.players.map((name) => String(name || '').trim()).filter(Boolean);
  }

  return String(item?.playing11 || '')
    .split(/\r?\n|,/) 
    .map((name) => name.trim())
    .filter(Boolean);
};

const parsePointsRows = (item) => {
  if (Array.isArray(item?.pointsTableRows) && item.pointsTableRows.length) {
    return item.pointsTableRows.map((row) => ({
      team: row?.team || '',
      played: row?.played || '',
      won: row?.won || '',
      lost: row?.lost || '',
      points: row?.points || '',
      nrr: row?.nrr || ''
    }));
  }

  return String(item?.pointsTable || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim());
      return {
        team: cells[0] || '',
        played: cells[1] || '',
        won: cells[2] || '',
        lost: cells[3] || '',
        points: cells[4] || '',
        nrr: cells[5] || ''
      };
    });
};

const serializePlayers = (players) => players.filter(Boolean).join(', ');

const serializePointsRows = (rows) => rows
  .filter((row) => Object.values(row).some((value) => String(value || '').trim()))
  .map((row) => [row.team, row.played, row.won, row.lost, row.points, row.nrr].map((value) => String(value || '').trim()).join('|'))
  .join('\n');

const getSectionKey = (pathname) => {
  if (pathname.endsWith('/hosted')) return 'hosted';
  if (pathname.endsWith('/external')) return 'external';
  if (pathname.endsWith('/live')) return 'live';
  if (pathname.endsWith('/fixtures')) return 'fixtures';
  if (pathname.endsWith('/history')) return 'history';
  return 'overview';
};

const getSectionType = (section) => {
  if (section === 'hosted') return 'Hosted';
  if (section === 'external') return 'External';
  if (section === 'live') return 'Live';
  if (section === 'fixtures') return 'Fixture';
  return null;
};

const getSaveLabel = (section) => {
  if (section === 'hosted') return 'Save Hosted Tournament';
  if (section === 'external') return 'Save External Tournament';
  if (section === 'live') return 'Save Live Tournament';
  if (section === 'fixtures') return 'Save Fixture';
  if (section === 'history') return 'Save History Record';
  return 'Save Tournament';
};

export default function AdminSports() {
  const location = useLocation();
  const section = getSectionKey(location.pathname);

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTournament);
  const [editingId, setEditingId] = useState(null);
  const [newPlayer, setNewPlayer] = useState('');
  const [pointsDraft, setPointsDraft] = useState(emptyPointsRow);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTournaments = () => {
    setLoading(true);
    sportsApi.getTournaments()
      .then((data) => setTournaments(Array.isArray(data) ? data : []))
      .catch((error) => {
        setErrorMessage(error?.message || 'Failed to load sports records.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    if (section === 'history') {
      return tournaments.filter((item) => String(item?.status || '').toLowerCase() === 'completed');
    }

    const sectionType = getSectionType(section);
    if (!sectionType) {
      return tournaments;
    }

    return tournaments.filter((item) => String(item?.tournamentType || '').toLowerCase() === sectionType.toLowerCase());
  }, [section, tournaments]);

  const resetForm = () => {
    const sectionType = getSectionType(section);
    setEditingId(null);
    setForm({
      ...emptyTournament,
      tournamentType: sectionType || emptyTournament.tournamentType,
      status: section === 'live' ? 'Live' : section === 'history' ? 'Completed' : 'Upcoming'
    });
    setNewPlayer('');
    setPointsDraft(emptyPointsRow);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      tournamentName: item.tournamentName || '',
      sportName: item.sportName || item.sport || 'Cricket',
      tournamentType: item.tournamentType || 'Hosted',
      hostedBy: item.hostedBy || '',
      year: item.year || new Date().getFullYear(),
      venue: item.venue || '',
      description: item.description || '',
      result: item.result || '',
      images: Array.isArray(item.images) ? item.images : [],
      currentTournament: item.currentTournament || '',
      fixtureLabel: item.fixtureLabel || '',
      teamA: item.teamA || '',
      teamB: item.teamB || '',
      playing11: item.playing11 || '',
      players: parsePlayers(item),
      hostedFixtures: item.hostedFixtures || '',
      pointsTable: item.pointsTable || '',
      pointsTableRows: parsePointsRows(item),
      otherStats: item.otherStats || '',
      matchSchedule: item.matchSchedule || '',
      teamDetails: item.teamDetails || '',
      registrationLink: item.registrationLink || '',
      liveLink: item.liveLink || '',
      status: item.status || 'Upcoming',
      sortOrder: item.sortOrder || 0
    });
    setNewPlayer('');
    setPointsDraft(emptyPointsRow);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const upsertLocal = (saved) => {
    setTournaments((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) {
        return prev.map((item) => (item.id === saved.id ? saved : item));
      }
      return [saved, ...prev];
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const sectionType = getSectionType(section);
    const payload = {
      ...form,
      tournamentType: sectionType || form.tournamentType,
      year: Number(form.year) || new Date().getFullYear(),
      status: section === 'live' ? 'Live' : section === 'history' ? 'Completed' : form.status,
      images: Array.isArray(form.images) ? form.images : [],
      players: Array.isArray(form.players) ? form.players : [],
      playing11: serializePlayers(Array.isArray(form.players) ? form.players : []),
      pointsTableRows: Array.isArray(form.pointsTableRows) ? form.pointsTableRows : [],
      pointsTable: serializePointsRows(Array.isArray(form.pointsTableRows) ? form.pointsTableRows : [])
    };

    try {
      const saved = editingId
        ? await sportsApi.updateTournament(editingId, payload)
        : await sportsApi.createTournament(payload);

      upsertLocal(saved);
      setSuccessMessage(editingId ? 'Record updated.' : 'Record created.');
      resetForm();
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save sports record.');
    }
  };

  const handleSavePointsTableOnly = async () => {
    if (!editingId) {
      setErrorMessage('Select a hosted or fixture record first, then save points table.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      players: Array.isArray(form.players) ? form.players : [],
      playing11: serializePlayers(Array.isArray(form.players) ? form.players : []),
      hostedFixtures: form.hostedFixtures || '',
      pointsTableRows: Array.isArray(form.pointsTableRows) ? form.pointsTableRows : [],
      pointsTable: serializePointsRows(Array.isArray(form.pointsTableRows) ? form.pointsTableRows : []),
      otherStats: form.otherStats || ''
    };

    try {
      const saved = await sportsApi.updateTournament(editingId, payload);
      upsertLocal(saved);
      setSuccessMessage('Points table and hosted desk saved.');
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to save points table.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await sportsApi.deleteTournament(id);
      setTournaments((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) {
        resetForm();
      }
      setSuccessMessage('Record deleted.');
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to delete record.');
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const encoded = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...encoded] }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, currentIndex) => currentIndex !== index)
    }));
  };

  const addPlayer = () => {
    const trimmed = newPlayer.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, players: [...(prev.players || []), trimmed] }));
    setNewPlayer('');
  };

  const removePlayer = (index) => {
    setForm((prev) => ({ ...prev, players: (prev.players || []).filter((_, i) => i !== index) }));
  };

  const addPointsRow = () => {
    if (!pointsDraft.team.trim()) return;
    setForm((prev) => ({ ...prev, pointsTableRows: [...(prev.pointsTableRows || []), pointsDraft] }));
    setPointsDraft(emptyPointsRow);
  };

  const removePointsRow = (index) => {
    setForm((prev) => ({
      ...prev,
      pointsTableRows: (prev.pointsTableRows || []).filter((_, i) => i !== index)
    }));
  };

  const showHostedDesk = section === 'hosted' || section === 'fixtures' || section === 'overview';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sports Admin</Typography>
      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        Section-based saves. Use separate admin pages for hosted, external, live, fixtures, and history records.
      </Typography>

      <Paper sx={{ p: 1.2, background: '#141414', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2.5, mb: 3 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {SECTION_LINKS.map((item) => (
            <Button
              key={item.key}
              component={Link}
              to={item.path}
              size="small"
              variant={section === item.key ? 'contained' : 'outlined'}
              color={section === item.key ? 'primary' : 'inherit'}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}
      {successMessage ? <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert> : null}

      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Sports Record' : 'Create Sports Record'}</Typography>
        <Box component="form" onSubmit={handleSave}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tournament Name" value={form.tournamentName} onChange={(e) => setForm({ ...form, tournamentName: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Sport" select value={form.sportName} onChange={(e) => setForm({ ...form, sportName: e.target.value })}>
                {SPORTS.map((sport) => <MenuItem key={sport} value={sport}>{sport}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
            </Grid>

            <Grid item xs={12} sm={6}><TextField fullWidth label="Hosted By" value={form.hostedBy} onChange={(e) => setForm({ ...form, hostedBy: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Grid>

            {(section === 'overview' || section === 'history' || section === 'external') ? (
              <Grid item xs={12}><TextField fullWidth label="Result" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} /></Grid>
            ) : null}

            {(section === 'overview' || section === 'live') ? (
              <>
                <Grid item xs={12} sm={6}><TextField fullWidth multiline rows={2} label="Current Tournament" value={form.currentTournament} onChange={(e) => setForm({ ...form, currentTournament: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth multiline rows={2} label="Match Schedule" value={form.matchSchedule} onChange={(e) => setForm({ ...form, matchSchedule: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Live Link" value={form.liveLink} onChange={(e) => setForm({ ...form, liveLink: e.target.value })} /></Grid>
              </>
            ) : null}

            {(section === 'overview' || section === 'fixtures' || section === 'hosted') ? (
              <>
                <Grid item xs={12}><Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }}><Chip label="Fixture" size="small" /></Divider></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Fixture Label" value={form.fixtureLabel} onChange={(e) => setForm({ ...form, fixtureLabel: e.target.value })} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Team A" value={form.teamA} onChange={(e) => setForm({ ...form, teamA: e.target.value })} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Team B" value={form.teamB} onChange={(e) => setForm({ ...form, teamB: e.target.value })} /></Grid>
              </>
            ) : null}

            {showHostedDesk ? (
              <>
                <Grid item xs={12}><Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }}><Chip label="Hosted Desk" size="small" /></Divider></Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Hosted Fixtures" value={form.hostedFixtures} onChange={(e) => setForm({ ...form, hostedFixtures: e.target.value })} /></Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Playing Squad</Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                    <TextField fullWidth label="Player name" value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} />
                    <Button variant="outlined" onClick={addPlayer}>Add Player</Button>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.2 }}>
                    {(form.players || []).length ? form.players.map((player, index) => (
                      <Chip key={`${player}-${index}`} label={player} onDelete={() => removePlayer(index)} />
                    )) : <Typography sx={{ opacity: 0.65 }}>No players added yet.</Typography>}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Points Table</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Team" value={pointsDraft.team} onChange={(e) => setPointsDraft({ ...pointsDraft, team: e.target.value })} /></Grid>
                    <Grid item xs={6} md={1.5}><TextField fullWidth label="P" value={pointsDraft.played} onChange={(e) => setPointsDraft({ ...pointsDraft, played: e.target.value })} /></Grid>
                    <Grid item xs={6} md={1.5}><TextField fullWidth label="W" value={pointsDraft.won} onChange={(e) => setPointsDraft({ ...pointsDraft, won: e.target.value })} /></Grid>
                    <Grid item xs={6} md={1.5}><TextField fullWidth label="L" value={pointsDraft.lost} onChange={(e) => setPointsDraft({ ...pointsDraft, lost: e.target.value })} /></Grid>
                    <Grid item xs={6} md={1.5}><TextField fullWidth label="Pts" value={pointsDraft.points} onChange={(e) => setPointsDraft({ ...pointsDraft, points: e.target.value })} /></Grid>
                    <Grid item xs={12} md={1.5}><TextField fullWidth label="NRR" value={pointsDraft.nrr} onChange={(e) => setPointsDraft({ ...pointsDraft, nrr: e.target.value })} /></Grid>
                    <Grid item xs={12} md={1}><Button fullWidth variant="outlined" onClick={addPointsRow}>Add</Button></Grid>
                  </Grid>

                  <TableContainer component={Paper} sx={{ mt: 1.5, background: '#111' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Team</TableCell><TableCell>P</TableCell><TableCell>W</TableCell><TableCell>L</TableCell><TableCell>Pts</TableCell><TableCell>NRR</TableCell><TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(form.pointsTableRows || []).length ? form.pointsTableRows.map((row, index) => (
                          <TableRow key={`${row.team}-${index}`}>
                            <TableCell>{row.team}</TableCell>
                            <TableCell>{row.played || '-'}</TableCell>
                            <TableCell>{row.won || '-'}</TableCell>
                            <TableCell>{row.lost || '-'}</TableCell>
                            <TableCell>{row.points || '-'}</TableCell>
                            <TableCell>{row.nrr || '-'}</TableCell>
                            <TableCell><Button color="error" size="small" onClick={() => removePointsRow(index)}>Remove</Button></TableCell>
                          </TableRow>
                        )) : <TableRow><TableCell colSpan={7}>No points rows added.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Other Stats" value={form.otherStats} onChange={(e) => setForm({ ...form, otherStats: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Registration Link" value={form.registrationLink} onChange={(e) => setForm({ ...form, registrationLink: e.target.value })} /></Grid>
              </>
            ) : null}

            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Status" select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><MenuItem value="Upcoming">Upcoming</MenuItem><MenuItem value="Live">Live</MenuItem><MenuItem value="Completed">Completed</MenuItem></TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Grid>

            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Button component="label" variant="outlined">
                  Upload images
                  <input hidden type="file" accept="image/*" multiple onChange={handleImageUpload} />
                </Button>
                <Typography sx={{ opacity: 0.75 }}>{(form.images || []).length} image(s) selected</Typography>
              </Stack>
              {(form.images || []).length > 0 ? (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {form.images.map((image, index) => (
                    <Grid item key={`preview-${index}`}>
                      <Box sx={{ position: 'relative' }}>
                        <Box component="img" src={image} alt={`preview ${index + 1}`} sx={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 1 }} />
                        <Button size="small" color="error" onClick={() => removeImage(index)} sx={{ minWidth: 0, px: 1 }}>x</Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : null}
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained">{getSaveLabel(section)}</Button>
              {showHostedDesk ? (
                <Button sx={{ ml: 1 }} variant="outlined" onClick={handleSavePointsTableOnly}>
                  Save Points Table
                </Button>
              ) : null}
              {editingId ? <Button sx={{ ml: 1 }} onClick={resetForm}>Cancel Edit</Button> : null}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" gutterBottom>Records In This Section</Typography>
        {loading ? (
          <Typography>Loading sports records...</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredTournaments.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ background: '#141414' }}>
                  <CardContent>
                    <Typography variant="h6">{item.tournamentName || 'Untitled tournament'}</Typography>
                    <Typography>{item.sportName || item.sport || 'Sport'} • {item.tournamentType || 'Type'} • {item.status || 'Status'} • {item.year || '-'}</Typography>
                    {item.fixtureLabel ? <Typography>{item.fixtureLabel}</Typography> : null}
                    {item.teamA || item.teamB ? <Typography>{item.teamA || 'Team A'} vs {item.teamB || 'Team B'}</Typography> : null}
                    {item.pointsTable ? <Typography sx={{ mt: 0.5, opacity: 0.82 }}>Points table configured</Typography> : null}
                    {item.liveLink ? <Typography sx={{ mt: 0.5, opacity: 0.82 }}>Live link configured</Typography> : null}
                    <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => startEdit(item)}>Edit</Button>
                    <Button sx={{ mt: 2 }} color="error" variant="outlined" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {!filteredTournaments.length ? (
              <Grid item xs={12}><Typography>No records in this section yet.</Typography></Grid>
            ) : null}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
