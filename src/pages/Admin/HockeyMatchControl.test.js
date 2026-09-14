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
  render(<MemoryRouter><HockeyMatchControl {...props} /></MemoryRouter>);
  return props;
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
