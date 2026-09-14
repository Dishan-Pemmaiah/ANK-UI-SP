import { useMemo, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

const poolName = (pool) => pool ? `Pool ${pool}` : 'League';
const poolsFor = (items) => [...new Set(items.map((item) => item.pool || ''))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export function HockeyTeams({ teams = [], players = [] }) {
  const [search, setSearch] = useState('');
  const [pool, setPool] = useState('');
  const [sort, setSort] = useState('name');
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);
  const visible = useMemo(() => teams.filter((team) => (!pool || (team.pool || '') === pool) && team.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    .sort((a, b) => sort === 'pool' ? (a.pool || '').localeCompare(b.pool || '', undefined, { numeric: true }) || a.name.localeCompare(b.name) : sort === 'reverse' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)), [teams, pool, search, sort]);
  const roster = players.filter((player) => player.team_id === selected?.id).sort((a, b) => (a.shirt_number ?? 999) - (b.shirt_number ?? 999) || a.name.localeCompare(b.name));
  return <Stack spacing={1.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField size="small" label="Search teams" value={search} onChange={(e) => { setSearch(e.target.value); setShowAll(false); }} sx={{ flex: 1 }} />
      <TextField select size="small" label="Pool" value={pool} onChange={(e) => { setPool(e.target.value); setShowAll(false); }} sx={{ minWidth: { sm: 150 } }}><MenuItem value="">All pools</MenuItem>{poolsFor(teams).map((value) => <MenuItem key={value} value={value}>{poolName(value)}</MenuItem>)}</TextField>
      <TextField select size="small" label="Sort teams" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: { sm: 150 } }}><MenuItem value="name">Name A–Z</MenuItem><MenuItem value="reverse">Name Z–A</MenuItem><MenuItem value="pool">Pool, then name</MenuItem></TextField>
    </Stack>
    <Typography color="text.secondary" variant="body2">Showing {Math.min(visible.length, showAll ? visible.length : 25)} of {visible.length} teams</Typography>
    {visible.slice(0, showAll ? undefined : 25).map((team) => <Paper key={team.id} variant="outlined" sx={{ px: { xs: 1.5, sm: 2 }, py: 1, minWidth: 0 }}><Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{team.name}</Typography><Typography variant="body2" color="text.secondary">{poolName(team.pool)}</Typography></Box>
      <Button size="small" onClick={() => setSelected(team)} sx={{ whiteSpace: 'nowrap' }}>View players</Button>
    </Stack></Paper>)}
    {!visible.length && <Typography color="text.secondary">No teams match your search.</Typography>}
    {visible.length > 25 && <Button variant="outlined" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show first 25' : `Show all ${visible.length} teams`}</Button>}
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>{selected?.name} · {poolName(selected?.pool)}</DialogTitle><DialogContent dividers>{roster.length ? <Stack spacing={1}>{roster.map((player) => <Stack key={player.id} direction="row" spacing={1} alignItems="center"><Chip size="small" label={player.shirt_number ?? '—'} /><Typography>{player.name}</Typography></Stack>)}</Stack> : <Typography color="text.secondary">No players added yet.</Typography>}</DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Close</Button></DialogActions></Dialog>
  </Stack>;
}

export function HockeyStandings({ rows = [] }) {
  const [search, setSearch] = useState('');
  const [pool, setPool] = useState('');
  const [showAll, setShowAll] = useState(false);
  const visible = useMemo(() => rows.filter((row) => (!pool || (row.pool || '') === pool) && row.team_name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    .sort((a, b) => (a.pool || '').localeCompare(b.pool || '', undefined, { numeric: true }) || b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for || a.team_name.localeCompare(b.team_name)), [rows, search, pool]);
  return <Stack spacing={1.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField size="small" label="Search standings" value={search} onChange={(e) => { setSearch(e.target.value); setShowAll(false); }} sx={{ flex: 1 }} />
      <TextField select size="small" label="Standings pool" value={pool} onChange={(e) => { setPool(e.target.value); setShowAll(false); }} sx={{ minWidth: { sm: 170 } }}><MenuItem value="">All pools</MenuItem>{poolsFor(rows).map((value) => <MenuItem key={value} value={value}>{poolName(value)}</MenuItem>)}</TextField>
      <TextField select size="small" label="Rows" value={showAll ? 'all' : '25'} onChange={(e) => setShowAll(e.target.value === 'all')} sx={{ minWidth: { sm: 125 } }}><MenuItem value="25">First 25</MenuItem><MenuItem value="all">Show all</MenuItem></TextField>
    </Stack>
    <Typography color="text.secondary" variant="body2">Showing {Math.min(visible.length, showAll ? visible.length : 25)} of {visible.length} teams · ranked by points, goal difference, then goals for in each pool</Typography>
    <Box sx={{ overflowX: 'auto', width: '100%' }}><Box component="table" aria-label="Hockey points table" sx={{ width: '100%', minWidth: 670, tableLayout: 'fixed', borderCollapse: 'collapse', '& th, & td': { py: 1, px: 0.5, textAlign: 'center', borderBottom: '1px solid #333', fontVariantNumeric: 'tabular-nums' }, '& th:first-of-type, & td:first-of-type': { width: '27%', textAlign: 'left', overflowWrap: 'anywhere' }, '& th:nth-of-type(2), & td:nth-of-type(2)': { width: '12%' }, '& tbody tr:hover': { bgcolor: 'rgba(255,255,255,.04)' } }}>
      <thead><tr>{['Team', 'Pool', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{visible.slice(0, showAll ? undefined : 25).map((row) => <tr key={row.team_id}><td>{row.team_name}</td><td>{row.pool || '—'}</td>{[row.played, row.won, row.drawn, row.lost, row.goals_for, row.goals_against, row.goal_difference, row.points].map((value, index) => <td key={index}>{value}</td>)}</tr>)}</tbody>
    </Box></Box>
    {!visible.length && <Typography color="text.secondary">{rows.length ? 'No teams match your search.' : 'Teams will appear here when added.'}</Typography>}
  </Stack>;
}
