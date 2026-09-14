import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminAnjk3 from './AdminAnjk3';
import { getSeasonData, saveSeason } from '../../services/hockeyService';

jest.mock('../../services/hockeyService', () => ({
  getSeasonData: jest.fn(), saveSeason: jest.fn(), saveTeam: jest.fn(), deleteTeam: jest.fn(),
  savePlayer: jest.fn(), deletePlayer: jest.fn(), saveMatch: jest.fn(), controlMatch: jest.fn(),
  correctResult: jest.fn(), saveAnnouncement: jest.fn(), deleteAnnouncement: jest.fn()
}));

const season = { id:'season-1', slug:'anjk-3', name:'ANJK 3', starts_at:null, ends_at:null,
  description:'', venue:'', poster_url:'', win_points:3, draw_points:1, loss_points:0 };
const data = { season, teams:[], players:[], matches:[], events:[], standings:[], announcements:[] };

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
