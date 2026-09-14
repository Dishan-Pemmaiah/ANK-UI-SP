import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HockeyKnockoutAdmin from './HockeyKnockoutAdmin';

const teams=[{id:'a',name:'Alpha'},{id:'b',name:'Bravo'}];
const match={id:'m',season_id:'s',round_id:'quarter',display_label:'Match 10',status:'Upcoming',home:teams[0],away:teams[1],home_score:0,away_score:0,scheduled_at:'2026-12-23T06:20:00Z'};

test('standard rounds show Quarter Final first, add only missing names, and expose fixture actions without bye form', () => {
  const onSaveRound=jest.fn(),onAddFixture=jest.fn(),onDeleteFixture=jest.fn();
  const rounds=[{id:'semi',name:'Semi Final',sort_order:1},{id:'quarter',name:'Quter Final',sort_order:30},{id:'final',name:'Final',sort_order:2,is_final:true}];
  render(<MemoryRouter><HockeyKnockoutAdmin season={{id:'s'}} teams={teams} rounds={rounds} matches={[match]} busy={false}
    onSaveRound={onSaveRound} onAddFixture={onAddFixture} onDeleteFixture={onDeleteFixture} onEditFixture={jest.fn()} onControlMatch={jest.fn()} onDeleteRound={jest.fn()} /></MemoryRouter>);
  const headings=screen.getAllByRole('heading',{level:6}).map((node) => node.textContent);
  expect(headings.slice(1,4)).toEqual(['Quarter Final','Semi Final','Final']);
  expect(screen.queryByRole('button',{name:'Add Quarter Final'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Add 3rd Place'}));
  expect(onSaveRound).toHaveBeenCalledWith(expect.objectContaining({name:'3rd Place',sort_order:3,is_final:false}));
  fireEvent.click(screen.getAllByRole('button',{name:'Add fixture'})[0]);
  expect(onAddFixture).toHaveBeenCalledWith(rounds[1]);
  fireEvent.click(screen.getByRole('button',{name:'Delete fixture'}));
  expect(onDeleteFixture).toHaveBeenCalledWith(match);
  expect(screen.queryByText('Assign bye / direct advance')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button',{name:'Delete round'})[0]).toBeDisabled();
});

test('unused round deletes after confirmation and legacy placements can be cleared', () => {
  window.confirm=jest.fn().mockReturnValue(true);
  const onDeleteRound=jest.fn(),onRemoveAdvancement=jest.fn();
  render(<MemoryRouter><HockeyKnockoutAdmin season={{id:'s'}} teams={teams} rounds={[{id:'quarter',name:'Quarter Final',sort_order:0}]} matches={[]}
    advancements={[{id:'adv',team_id:'a',target_match_id:'m',target_slot:'home',kind:'Bye',is_active:true}]} busy={false}
    onDeleteRound={onDeleteRound} onRemoveAdvancement={onRemoveAdvancement} /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'Delete round'}));
  expect(onDeleteRound).toHaveBeenCalledWith('quarter');
  fireEvent.click(screen.getByRole('button',{name:'Clear placement'}));
  expect(onRemoveAdvancement).toHaveBeenCalledWith('adv');
});
