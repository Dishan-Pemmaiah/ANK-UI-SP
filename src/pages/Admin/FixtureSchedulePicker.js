import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const two = (value) => String(value).padStart(2, '0');
const parseSchedule = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
  return match ? { date: `${match[1]}-${match[2]}-${match[3]}`, hour: Number(match[4]), minute: match[5] } : null;
};
const formatSchedule = (value) => {
  const schedule = parseSchedule(value);
  if (!schedule) return 'Choose date and start time';
  const date = new Date(`${schedule.date}T${two(schedule.hour)}:${schedule.minute}:00+05:30`);
  return `${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(date)} · ${two(schedule.hour % 12 || 12)}:${schedule.minute} ${schedule.hour >= 12 ? 'PM' : 'AM'} IST`;
};

export default function FixtureSchedulePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('PM');

  const show = () => {
    const saved = parseSchedule(value);
    const initial = saved?.date ? new Date(`${saved.date}T12:00:00`) : new Date();
    setMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
    setDate(saved?.date || '');
    setHour(String(saved ? saved.hour % 12 || 12 : 12));
    setMinute(saved?.minute || '00');
    setPeriod(saved && saved.hour < 12 ? 'AM' : 'PM');
    setOpen(true);
  };
  const firstDay = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  const selectDay = (day) => setDate(`${month.getFullYear()}-${two(month.getMonth() + 1)}-${two(day)}`);
  const save = () => {
    const hour24 = Number(hour) % 12 + (period === 'PM' ? 12 : 0);
    onChange(`${date}T${two(hour24)}:${two(Number(minute))}`);
    setOpen(false);
  };
  return <>
    <Button fullWidth variant="outlined" color="inherit" startIcon={<CalendarMonthIcon />} onClick={show} aria-label="Open fixture date and time picker" sx={{ justifyContent: 'flex-start', minHeight: 56, px: 2, textAlign: 'left' }}>{formatSchedule(value)}</Button>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" aria-labelledby="fixture-schedule-title">
      <DialogTitle id="fixture-schedule-title">Match date and time</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select the date and start time in Indian Standard Time.</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeftIcon /></Button>
          <Typography fontWeight={800}>{new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(month)}</Typography>
          <Button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRightIcon /></Button>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.5 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => <Typography key={index} variant="caption" align="center" color="text.secondary">{label}</Typography>)}
          {days.map((day, index) => day ? <Button key={index} aria-label={`${day} ${new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(month)}`} aria-pressed={date === `${month.getFullYear()}-${two(month.getMonth() + 1)}-${two(day)}`} onClick={() => selectDay(day)} variant={date === `${month.getFullYear()}-${two(month.getMonth() + 1)}-${two(day)}` ? 'contained' : 'text'} sx={{ minWidth: 0, minHeight: 42, p: 0, borderRadius: 1.5 }}>{day}</Button> : <Box key={index} />)}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <TextField select size="small" label="Hour" value={hour} onChange={(event) => setHour(event.target.value)} sx={{ flex: 1 }}>{Array.from({ length: 12 }, (_, index) => index + 1).map((option) => <MenuItem key={option} value={String(option)}>{two(option)}</MenuItem>)}</TextField>
          <TextField size="small" type="number" label="Minute" value={minute} onChange={(event) => setMinute(event.target.value)} inputProps={{ min: 0, max: 59, inputMode: 'numeric' }} sx={{ flex: 1 }} />
          <TextField select size="small" label="AM or PM" value={period} onChange={(event) => setPeriod(event.target.value)} sx={{ flex: 1 }}><MenuItem value="AM">AM</MenuItem><MenuItem value="PM">PM</MenuItem></TextField>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={!date || minute === '' || !Number.isInteger(Number(minute)) || Number(minute) < 0 || Number(minute) > 59} onClick={save}>Use date and time</Button></DialogActions>
    </Dialog>
  </>;
}
