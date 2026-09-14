import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HockeyKnockoutBracket from './HockeyKnockoutBracket';

test('standard rounds appear Quarter, Semi, Final, Third with readable stacked teams and TBD slots', () => {
  const teams = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }];
  const matches = [
    { id: 'first', round_id: 'quarter', display_label: 'Match 10', round_name: 'Quarter Final', home: teams[0], away: teams[1], home_team_id: 'a', away_team_id: 'b', home_score: 2, away_score: 1, winner_team_id: 'a', decision_method: 'Normal', status: 'Completed', scheduled_at: '2026-12-23T06:20:00Z' },
    { id: 'next', round_id: 'semi', display_label: 'Match 51', round_name: 'Semi Final', home: null, away: null, home_slot_label: 'Winner of Match 10', away_slot_label: 'TBD', status: 'Upcoming', scheduled_at: '2026-12-25T06:20:00Z' }
  ];
  render(<MemoryRouter><HockeyKnockoutBracket rounds={[{ id:'third',name:'3rd Place',sort_order:1 },{ id:'semi',name:'Semi Final',sort_order:2 },{ id:'final',name:'Final',sort_order:3 },{ id:'quarter',name:'Quter Final',sort_order:8 }]} matches={matches} teams={teams} championId="a" /></MemoryRouter>);
  const headings = screen.getAllByRole('heading', { level: 6 }).map((item) => item.textContent);
  expect(headings).toEqual(['Quarter Final', 'Semi Final', 'Final', '3rd Place', 'Champion']);
  expect(screen.getByText('Winner of Match 10')).toBeInTheDocument();
  expect(screen.getByText('TBD')).toBeInTheDocument();
  expect(screen.getByText(/Winner: Alpha/)).toBeInTheDocument();
  expect(screen.getByTitle('Alpha')).toHaveStyle('white-space: nowrap');
});
