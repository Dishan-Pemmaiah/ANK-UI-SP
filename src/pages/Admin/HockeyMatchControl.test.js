import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HockeyMatchControl from './HockeyMatchControl';

const home = { id:'a', name:'Alpha' };
const away = { id:'b', name:'Bravo' };
const match = { id:'m', home, away, home_team_id:'a', away_team_id:'b', home_score:0, away_score:1, status:'Live', phase:'1st Half', stage:'Group', scheduled_at:'2026-09-14T10:00:00+05:30' };

const setup = (overrides = {}) => {
  const props = {
    matches:[match], players:[{ id:'pa',team_id:'a',name:'A scorer',shirt_number:7 }],
    selectedMatch:match, selectMatch:jest.fn(), scorers:{ home:'',away:'' }, setScorers:jest.fn(),
    busy:false, matchAction:jest.fn(), correct:{ home:0,away:1 }, setCorrect:jest.fn(),
    saveCorrection:jest.fn(), saveGoalCorrection:jest.fn().mockResolvedValue(true), requestDeleteMatch:jest.fn(), confirmEnd:false, setConfirmEnd:jest.fn(), ...overrides
  };
  const view = render(<MemoryRouter><HockeyMatchControl {...props} /></MemoryRouter>);
  return { ...props, rerender: (next) => view.rerender(<MemoryRouter><HockeyMatchControl {...props} {...next} /></MemoryRouter>) };
};

test('live controls show phase, large score and quick goals without a selected scorer', () => {
  const props = setup();
  expect(screen.getByLabelText('Current score')).toHaveTextContent('0 – 1');
  expect(screen.getByText('● 1st Half')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name:'Alpha + Goal' }));
  fireEvent.click(screen.getByRole('button', { name:'Bravo + Goal' }));
  expect(props.matchAction).toHaveBeenCalledWith('home_goal','a','');
  expect(props.matchAction).toHaveBeenCalledWith('away_goal','b','');
  expect(screen.getByRole('button', { name:'Undo Alpha goal' })).toBeDisabled();
});

test('selected scorer is passed without an extra goal-screen step', () => {
  const props = setup({ scorers:{ home:'pa',away:'' } });
  fireEvent.click(screen.getByRole('button', { name:'Alpha + Goal' }));
  expect(props.matchAction).toHaveBeenCalledWith('home_goal','a','pa');
});

test('ending a live match requires confirmation', () => {
  const props = setup({ confirmEnd:true });
  expect(screen.getByText('End match?')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name:'Confirm final result' }));
  expect(props.matchAction).toHaveBeenCalledWith('end');
});

test('completed match allows a specific goal scorer correction and removal', () => {
  const completed = { ...match, status: 'Completed', home_score: 1 };
  const goal = { id: 'goal-1', match_id: 'm', team_id: 'a', event_type: 'Goal', player_id: null, is_voided: false, created_at: '2026-09-14T10:00:00Z' };
  const props = setup({ selectedMatch: completed, matches: [completed], events: [goal] });
  fireEvent.mouseDown(screen.getByLabelText('Scorer for goal 1'));
  fireEvent.click(screen.getByRole('option', { name: /A scorer/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Save scorer' }));
  expect(props.saveGoalCorrection).toHaveBeenCalledWith('assign', 'goal-1', 'a', 'pa');
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: 'Remove goal' }));
  expect(props.saveGoalCorrection).toHaveBeenCalledWith('remove', 'goal-1', 'a');
  confirm.mockRestore();
});

test('Match Control exposes match deletion through the confirmation flow', () => {
  const props = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Delete match' }));
  expect(props.requestDeleteMatch).toHaveBeenCalledWith(match);
});

test('refreshing a live match keeps one editable update and player form', () => {
  const props = setup();
  fireEvent.change(screen.getByLabelText('Public match note'), { target: { value: 'Rain delay' } });
  fireEvent.change(screen.getByLabelText('Player name'), { target: { value: 'New striker' } });
  for (let index = 0; index < 3; index += 1) {
    props.rerender({ selectedMatch: { ...match }, matches: [{ ...match }] });
    expect(screen.getAllByText('Match update')).toHaveLength(1);
    expect(screen.getAllByText('Add player for this match')).toHaveLength(1);
    expect(screen.getByLabelText('Public match note')).toHaveValue('Rain delay');
    expect(screen.getByLabelText('Player name')).toHaveValue('New striker');
  }
  fireEvent.change(screen.getByLabelText('Public match note'), { target: { value: 'Rain delayed' } });
  expect(screen.getByLabelText('Public match note')).toHaveValue('Rain delayed');
});

test('tied knockout match requires a chosen winner and shootout decision', async () => {
  const tied = { ...match, home_score: 1, away_score: 1 };
  const completeKnockout = jest.fn().mockResolvedValue(true);
  const props = setup({ selectedMatch: tied, matches: [tied], isKnockout: true, completeKnockout });
  fireEvent.click(screen.getByRole('button', { name: 'END MATCH' }));
  props.rerender({ confirmEnd: true });
  expect(screen.getByRole('button', { name: 'Confirm final result' })).toBeDisabled();
  fireEvent.mouseDown(screen.getByLabelText('Winner'));
  fireEvent.click(screen.getByRole('option', { name: 'Alpha' }));
  fireEvent.mouseDown(screen.getByLabelText('Decision method'));
  fireEvent.click(screen.getByRole('option', { name: 'Shootout' }));
  fireEvent.change(screen.getByLabelText('Team A shootout'), { target: { value: '4' } });
  fireEvent.change(screen.getByLabelText('Team B shootout'), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm final result' }));
  expect(completeKnockout).toHaveBeenCalledWith('a', 'Shootout', 4, 3);
});

test('non-tied knockout preselects higher scorer; a walkover needs a real opponent and explicit winner', () => {
  const completeKnockout = jest.fn().mockResolvedValue(true);
  const props = setup({ isKnockout: true, completeKnockout });
  fireEvent.click(screen.getByRole('button', { name: 'END MATCH' }));
  props.rerender({ confirmEnd: true });
  expect(screen.getByLabelText('Winner')).toHaveTextContent('Bravo');
  fireEvent.click(screen.getByRole('button', { name: 'Keep match open' }));
});

test('TBD knockout fixture cannot start', () => {
  const tbd = { ...match, status: 'Upcoming', home_team_id: null, home: null };
  setup({ selectedMatch: tbd, matches: [tbd], isKnockout: true });
  expect(screen.getByRole('button', { name: 'START MATCH' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Record walkover' })).toBeDisabled();
});

test('upcoming knockout walkover records an explicit winner without adding goals', () => {
  const upcoming = { ...match, status: 'Upcoming', home_score: 0, away_score: 0 };
  const completeKnockout = jest.fn().mockResolvedValue(true);
  const props = setup({ selectedMatch: upcoming, matches: [upcoming], isKnockout: true, completeKnockout });
  fireEvent.click(screen.getByRole('button', { name: 'Record walkover' }));
  props.rerender({ confirmEnd: true });
  fireEvent.mouseDown(screen.getByLabelText('Winner'));
  fireEvent.click(screen.getByRole('option', { name: 'Alpha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm final result' }));
  expect(completeKnockout).toHaveBeenCalledWith('a', 'Walkover', null, null);
});

test('knockout score correction requires the winner and blocks while advanced', () => {
  const completed = { ...match, status: 'Completed', home_score: 2, away_score: 1, winner_team_id: 'a', decision_method: 'Normal' };
  const saveKnockoutCorrection = jest.fn();
  const props = setup({ selectedMatch: completed, matches: [completed], isKnockout: true, saveKnockoutCorrection, correct: { home: 2, away: 1 }, hasAdvancement: true });
  expect(screen.getByText(/Remove the winner's existing advancement/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save knockout correction' })).toBeDisabled();
  props.rerender({ hasAdvancement: false });
  fireEvent.click(screen.getByRole('button', { name: 'Save knockout correction' }));
  expect(saveKnockoutCorrection).toHaveBeenCalledWith('a', 'Normal', null, null);
});
