import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HockeyKnockoutAdmin from './HockeyKnockoutAdmin';

const teams = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }];
const rounds = [{ id: 'one', name: 'Opening', sort_order: 1 }, { id: 'two', name: 'Custom final', sort_order: 2, is_final: true }];
const matches = [
  { id: 'source', season_id: 's', round_id: 'one', round_name: 'Opening', display_label: 'Match 10', status: 'Completed', home: teams[0], away: teams[1], home_team_id: 'a', away_team_id: 'b', winner_team_id: 'a', decision_method: 'Normal', home_score: 2, away_score: 1, scheduled_at: '2026-12-23T06:20:00Z' },
  { id: 'target', season_id: 's', round_id: 'two', round_name: 'Custom final', display_label: 'Match 51', status: 'Upcoming', home: null, away: null, scheduled_at: '2026-12-25T06:20:00Z' }
];

test('organizer can plan an optional destination, manually advance and assign a bye', () => {
  const onSetProgression = jest.fn(); const onAdvanceWinner = jest.fn(); const onAssignBye = jest.fn();
  render(<MemoryRouter><HockeyKnockoutAdmin season={{ id: 's' }} teams={teams} rounds={rounds} matches={matches} advancements={[]} busy={false}
    onSaveRound={jest.fn()} onDeleteRound={jest.fn()} onMoveRound={jest.fn()} onEditFixture={jest.fn()} onControlMatch={jest.fn()}
    onSetProgression={onSetProgression} onAdvanceWinner={onAdvanceWinner} onAssignBye={onAssignBye} onRemoveAdvancement={jest.fn()} onSetWinner={jest.fn()} onSetChampion={jest.fn()} /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole('button', { name: 'Progression / winner' })[0]);
  expect(screen.getByText('Not assigned')).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByLabelText('Next match'));
  fireEvent.click(screen.getByRole('option', { name: /Match 51/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Save next-match assignment' }));
  expect(onSetProgression).toHaveBeenCalledWith('source', 'target', 'home', false);
  fireEvent.click(screen.getByRole('button', { name: 'Advance winner now' }));
  expect(onAdvanceWinner).toHaveBeenCalledWith('source', 'target', 'home');
  fireEvent.mouseDown(screen.getByLabelText('Team receiving bye'));
  fireEvent.click(screen.getByRole('option', { name: 'Bravo' }));
  fireEvent.mouseDown(screen.getByLabelText('Target round'));
  fireEvent.click(screen.getByRole('option', { name: 'Custom final' }));
  fireEvent.mouseDown(screen.getByLabelText('Target fixture'));
  fireEvent.click(screen.getByRole('option', { name: 'Match 51' }));
  fireEvent.mouseDown(screen.getAllByLabelText('Target slot')[0]);
  fireEvent.click(screen.getByRole('option', { name: 'Team B' }));
  fireEvent.change(screen.getByLabelText('Reason (optional)'), { target: { value: 'Bye' } });
  fireEvent.click(screen.getByRole('button', { name: 'Assign bye' }));
  expect(onAssignBye).toHaveBeenCalledWith('b', 'target', 'away', 'Bye');
});
