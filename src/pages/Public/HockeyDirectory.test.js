import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HockeyStandings, HockeyTeams } from './HockeyDirectory';

const teams = Array.from({ length: 100 }, (_, index) => ({ id: `team-${index}`, name: `Team ${String(index).padStart(3, '0')}`, pool: index % 2 ? 'B' : 'A' }));

test('large team directory searches, filters by pool and opens the correct roster', async () => {
  render(<HockeyTeams teams={teams} players={[{ id: 'player-1', team_id: 'team-42', name: 'Scorer', shirt_number: 9 }]} />);
  expect(screen.getByText('Showing 25 of 100 teams')).toBeInTheDocument();
  expect(screen.queryByText('Team 042')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search teams'), { target: { value: 'Team 042' } });
  expect(screen.getByText('Showing 1 of 1 teams')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'View players' }));
  expect(within(screen.getByRole('dialog')).getByText('Scorer')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('Search teams'), { target: { value: '' } });
  fireEvent.mouseDown(screen.getByLabelText('Pool'));
  fireEvent.click(screen.getByRole('option', { name: 'Pool B' }));
  expect(screen.getByText('Showing 25 of 50 teams')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show all 50 teams' }));
  expect(screen.getByText('Showing 50 of 50 teams')).toBeInTheDocument();
});

test('points table keeps all pools in one aligned table and offers search and show all', () => {
  const rows = teams.map((team, index) => ({ team_id: team.id, team_name: team.name, pool: team.pool, played: 1, won: 0, drawn: 1, lost: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: index % 3 }));
  render(<HockeyStandings rows={rows} />);
  const table = screen.getByRole('table', { name: 'Hockey points table' });
  expect(within(table).getAllByRole('columnheader')).toHaveLength(10);
  expect(within(table).getAllByRole('row')).toHaveLength(26);
  fireEvent.mouseDown(screen.getByLabelText('Rows'));
  fireEvent.click(screen.getByRole('option', { name: 'Show all' }));
  expect(within(table).getAllByRole('row')).toHaveLength(101);
  fireEvent.change(screen.getByLabelText('Search standings'), { target: { value: 'Team 042' } });
  expect(within(table).getAllByRole('row')).toHaveLength(2);
});
