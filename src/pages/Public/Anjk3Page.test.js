import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Anjk3Page from './Anjk3Page';
import { getSeasonData } from '../../services/hockeyService';

jest.mock('../../services/hockeyService', () => ({ getSeasonData: jest.fn() }));

const match = {
  id: 'match-1', status: 'Completed', stage: 'Group', pool: 'A',
  scheduled_at: '2026-09-14T10:00:00+05:30', home_score: 2, away_score: 1,
  home: { id: 'a', name: 'Alpha' }, away: { id: 'b', name: 'Bravo' }
};

test('calendar opens and Clear filters restores results and clears the date input', async () => {
  getSeasonData.mockResolvedValue({
    season: { id: 'season-1', name: 'ANJK 3' },
    teams: [{ id: 'a', name: 'Alpha', pool: 'A' }, { id: 'b', name: 'Bravo', pool: 'A' }],
    matches: [match], standings: [], announcements: [], players: [], events: []
  });
  render(<MemoryRouter initialEntries={['/anjk-3?tab=results']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter>);
  expect(await screen.findByText('Alpha')).toBeInTheDocument();
  const dateInput = screen.getByLabelText('Match date');
  dateInput.showPicker = jest.fn();
  fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(dateInput.showPicker).toHaveBeenCalledTimes(1);
  fireEvent.change(dateInput, { target: { value: '2026-09-15' } });
  expect(screen.getByText('No matches match these filters.')).toBeInTheDocument();
  expect(screen.getByText(/Filters: 2026-09-15/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByLabelText('Match date')).toHaveValue('');
  expect(screen.getByText('Showing all dates, pools and stages')).toBeInTheDocument();
  expect(screen.getByText('Alpha')).toBeInTheDocument();
});
