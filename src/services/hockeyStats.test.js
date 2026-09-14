import { getHockeyStats } from './hockeyStats';

const teams = [{ id:'a',name:'Alpha' },{ id:'b',name:'Bravo' },{ id:'c',name:'Charlie' }];
const players = [{ id:'pa',team_id:'a',name:'A scorer' },{ id:'pb',team_id:'b',name:'B scorer' }];
const matches = [
  { id:'group',status:'Completed',stage:'Group',home_team_id:'a',away_team_id:'b',home_score:2,away_score:1 },
  { id:'draw',status:'Completed',stage:'Group',home_team_id:'a',away_team_id:'c',home_score:1,away_score:1 },
  { id:'final',status:'Completed',stage:'Final',home_team_id:'a',away_team_id:'b',home_score:3,away_score:0 },
  { id:'postponed',status:'Postponed',stage:'Group',home_team_id:'b',away_team_id:'c',home_score:9,away_score:0 },
  { id:'cancelled',status:'Cancelled',stage:'Group',home_team_id:'b',away_team_id:'c',home_score:8,away_score:0 }
];

test('completed results drive goals and wins; credited events exclude undone goals', () => {
  const events = [
    { match_id:'group',event_type:'Goal',player_id:'pa',is_voided:false },
    { match_id:'group',event_type:'Goal',player_id:'pa',is_voided:true },
    { match_id:'group',event_type:'Goal Removed',player_id:null },
    { match_id:'group',event_type:'Goal',player_id:'pb',is_voided:false },
    { match_id:'postponed',event_type:'Goal',player_id:'pb',is_voided:false }
  ];
  const stats = getHockeyStats(matches,events,teams,players);
  expect(stats.matchesPlayed).toBe(3);
  expect(stats.totalGoals).toBe(8);
  expect(stats.teamGoals.map(({ team, goals }) => [team.name,goals])).toEqual([['Alpha',6],['Bravo',1],['Charlie',1]]);
  expect(stats.mostWins[0]).toMatchObject({ team:teams[0],wins:2 });
  expect(stats.topScorers.map(({ player, goals }) => [player.name,goals])).toEqual([['A scorer',1],['B scorer',1]]);
});

test('empty sections stay empty before completed matches', () => {
  expect(getHockeyStats([],[],teams,players)).toMatchObject({ matchesPlayed:0,totalGoals:0,topScorers:[],teamGoals:[],mostWins:[] });
});
