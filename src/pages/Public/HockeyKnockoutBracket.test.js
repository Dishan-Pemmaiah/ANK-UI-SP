import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HockeyKnockoutBracket from './HockeyKnockoutBracket';

test('organizer-created rounds render in order with future winner slots and champion', () => {
  const teams = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }];
  const matches = [
    { id: 'first', round_id: 'opening', display_label: 'Match 10', round_name: 'Opening', home: teams[0], away: teams[1], home_team_id: 'a', away_team_id: 'b', home_score: 2, away_score: 1, winner_team_id: 'a', decision_method: 'Normal', status: 'Completed', scheduled_at: '2026-12-23T06:20:00Z' },
    { id: 'next', round_id: 'later', display_label: 'Match 51', round_name: 'Custom finish', home: null, away: null, home_slot_label: 'Winner of Match 10', away_slot_label: 'TBD', status: 'Upcoming', scheduled_at: '2026-12-25T06:20:00Z' }
  ];
  render(<MemoryRouter><HockeyKnockoutBracket rounds={[{ id: 'later', name: 'Custom finish', sort_order: 2 }, { id: 'opening', name: 'Opening', sort_order: 1 }]} matches={matches} teams={teams} championId="a" /></MemoryRouter>);
  const headings = screen.getAllByRole('heading', { level: 6 }).map((item) => item.textContent);
  expect(headings).toEqual(['Opening', 'Custom finish', 'Champion']);
  expect(screen.getByText('Winner of Match 10')).toBeInTheDocument();
  expect(screen.getByText('TBD')).toBeInTheDocument();
  expect(screen.getByText(/Winner: Alpha/)).toBeInTheDocument();
});
