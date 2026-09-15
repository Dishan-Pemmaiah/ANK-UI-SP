import { roundPosition, sortKnockoutRounds } from './hockeyRoundOrder';

test('standard bracket order is stable even when old round names and sort values differ', () => {
  const rounds=[{name:'3rd Place',sort_order:1},{name:'Final',sort_order:2},{name:'1',sort_order:0},
    {name:'Semi Final',sort_order:5},{name:'Quter Final',sort_order:10}];
  expect(sortKnockoutRounds(rounds).map((item) => item.name)).toEqual(['1','Quter Final','Semi Final','Final','3rd Place']);
  expect(roundPosition('Quarter Final')).toBe(0);
  expect(roundPosition('2')).toBe(1);
  expect(rounds[0].name).toBe('3rd Place');
});
