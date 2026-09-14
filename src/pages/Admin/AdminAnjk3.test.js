import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminAnjk3 from './AdminAnjk3';
import { deleteMatch, getSeasonData, saveMatch, saveSeason } from '../../services/hockeyService';

jest.mock('../../services/hockeyService', () => ({
  getSeasonData: jest.fn(), saveSeason: jest.fn(), saveTeam: jest.fn(), deleteTeam: jest.fn(),
  savePlayer: jest.fn(), deletePlayer: jest.fn(), saveMatch: jest.fn(), deleteMatch: jest.fn(), controlMatch: jest.fn(),
  correctResult: jest.fn(), saveAnnouncement: jest.fn(), deleteAnnouncement: jest.fn()
}));

const season = { id:'season-1', slug:'anjk-3', name:'ANJK 3', starts_at:null, ends_at:null,
  description:'', venue:'', poster_url:'', win_points:3, draw_points:1, loss_points:0 };
const data = { season, teams:[], players:[], matches:[], events:[], standings:[], announcements:[] };
const fixture = { id: 'match-1', season_id: 'season-1', status: 'Upcoming', stage: 'Group', home_team_id: 'a', away_team_id: 'b', scheduled_at: '2026-12-23T06:20:00Z', home_score: 0, away_score: 0, home: { id: 'a', name: 'Alpha' }, away: { id: 'b', name: 'Bravo' } };

test('tournament dates save without requiring a time and remain visible', async () => {
  getSeasonData.mockResolvedValue(data);
  saveSeason.mockImplementation(async (payload) => ({ ...season, ...payload }));
  render(<MemoryRouter initialEntries={['/admin/anjk-3']}><Routes><Route path="/admin/anjk-3" element={<AdminAnjk3 />} /></Routes></MemoryRouter>);
  const start = await screen.findByLabelText('Starts');
  const end = screen.getByLabelText('Ends');
  expect(start).toHaveAttribute('type','date');
  fireEvent.change(start, { target: { value:'2026-10-20' } });
  fireEvent.change(end, { target: { value:'2026-10-22' } });
  fireEvent.click(screen.getByRole('button', { name:'Save tournament' }));
  await waitFor(() => expect(saveSeason).toHaveBeenCalledWith(expect.objectContaining({
    starts_at:'2026-10-19T18:30:00.000Z', ends_at:'2026-10-22T18:29:59.999Z'
  }), 'season-1'));
  expect(await screen.findByDisplayValue('2026-10-20')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2026-10-22')).toBeInTheDocument();
});

test('CMS live-match link opens Match Control with the requested match selected', async () => {
  getSeasonData.mockResolvedValue({ ...data, matches: [{ id: 'match-1', status: 'Live', phase: '1st Half', scheduled_at: '2026-12-23T06:20:00Z', home_score: 2, away_score: 0, home_team_id: 'a', away_team_id: 'b', home: { id: 'a', name: 'Alpha' }, away: { id: 'b', name: 'Bravo' } }] });
  render(<MemoryRouter initialEntries={['/admin/anjk-3?tab=match-control&match=match-1']}><Routes><Route path="/admin/anjk-3" element={<AdminAnjk3 />} /></Routes></MemoryRouter>);
  expect(await screen.findByLabelText('Current score')).toHaveTextContent('2 – 0');
  expect(screen.getByRole('tab', { name: /match control/i })).toHaveAttribute('aria-selected', 'true');
});

test('fixture editor selects date and time in one calendar dialog and saves IST', async () => {
  getSeasonData.mockResolvedValue({ ...data, teams: [fixture.home, fixture.away], matches: [fixture] });
  saveMatch.mockResolvedValue(fixture);
  render(<MemoryRouter initialEntries={['/admin/anjk-3']}><Routes><Route path="/admin/anjk-3" element={<AdminAnjk3 />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('tab', { name: /fixtures/i }));
  fireEvent.click(await screen.findByRole('button', { name: 'Edit / reschedule' }));
  const picker = screen.getByRole('button', { name: 'Open fixture date and time picker' });
  expect(picker).toHaveTextContent('23 Dec 2026 · 11:50 AM IST');
  fireEvent.click(picker);
  fireEvent.click(screen.getByRole('button', { name: '24 December 2026' }));
  fireEvent.mouseDown(screen.getByLabelText('Hour'));
  fireEvent.click(screen.getByRole('option', { name: '02' }));
  fireEvent.change(screen.getByLabelText('Minute'), { target: { value: '30' } });
  fireEvent.mouseDown(screen.getByLabelText('AM or PM'));
  fireEvent.click(screen.getByRole('option', { name: 'PM' }));
  fireEvent.click(screen.getByRole('button', { name: 'Use date and time' }));
  expect(picker).toHaveTextContent('24 Dec 2026 · 02:30 PM IST');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
  await waitFor(() => expect(saveMatch).toHaveBeenCalledWith(expect.objectContaining({ scheduled_at: '2026-12-24T09:00:00.000Z' }), 'match-1'));
  expect(await screen.findByText('Fixture saved.')).toBeInTheDocument();
});

test('completed match deletion requires confirmation and removes only that match', async () => {
  const completed = { ...fixture, status: 'Completed', home_score: 2 };
  getSeasonData.mockResolvedValueOnce({ ...data, matches: [completed] }).mockResolvedValue({ ...data, matches: [] });
  deleteMatch.mockResolvedValue({ id: 'match-1' });
  render(<MemoryRouter initialEntries={['/admin/anjk-3']}><Routes><Route path="/admin/anjk-3" element={<AdminAnjk3 />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('tab', { name: /fixtures/i }));
  fireEvent.click(await screen.findByRole('button', { name: 'Delete match' }));
  expect(screen.getByText(/permanently removes the fixture/)).toBeInTheDocument();
  expect(deleteMatch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Delete match permanently' }));
  await waitFor(() => expect(deleteMatch).toHaveBeenCalledWith('match-1'));
  expect(await screen.findByText('Match deleted. Its goals and result were removed from the tournament.')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
