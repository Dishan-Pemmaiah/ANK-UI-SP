import { controlMatch, correctGoal, correctResult, deleteMatch, deletePlayer, getSeasonData, saveMatch, savePlayer, saveSeason, saveTeam } from './hockeyService';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn(), rpc: jest.fn() } }));

const query = (value) => {
  const result = { data: value, error: null };
  const chain = { insert: jest.fn(), update: jest.fn(), delete: jest.fn(), eq: jest.fn(), select: jest.fn(), single: jest.fn().mockResolvedValue(result) };
  Object.keys(chain).filter((key) => key !== 'single').forEach((key) => chain[key].mockReturnValue(chain));
  return chain;
};

beforeEach(() => jest.clearAllMocks());

test('creates season, team, and fixture in separate tables', async () => {
  const chain = query({ id: 'new' }); supabase.from.mockReturnValue(chain);
  await saveSeason({ slug:'anjk-3', name:'ANJK 3' });
  await saveTeam({ season_id:'season-1', name:'Team A' });
  await saveMatch({ season_id:'season-1', home_team_id:'a', away_team_id:'b' });
  expect(supabase.from.mock.calls.map(([name]) => name)).toEqual(['hockey_seasons','hockey_teams','hockey_matches']);
  expect(chain.insert).toHaveBeenCalledTimes(3);
});

test('deletes only the selected hockey match', async () => {
  const chain = query({ id: 'match-1' }); supabase.from.mockReturnValue(chain);
  await deleteMatch('match-1');
  expect(supabase.from).toHaveBeenCalledWith('hockey_matches');
  expect(chain.delete).toHaveBeenCalledTimes(1);
  expect(chain.eq).toHaveBeenCalledWith('id', 'match-1');
});

test('start, phase, scorer and quick goals, undo, end, postpone, cancel and correction use database actions', async () => {
  supabase.rpc.mockResolvedValue({ data: { id:'match-1' }, error:null });
  await controlMatch('match-1','start');
  await controlMatch('match-1','home_goal','team-a','player-a');
  await controlMatch('match-1','away_goal','team-b');
  await controlMatch('match-1','home_undo','team-a');
  await controlMatch('match-1','phase_half');
  await controlMatch('match-1','phase_second');
  await controlMatch('match-1','end');
  await controlMatch('match-2','postpone');
  await controlMatch('match-3','cancel');
  await correctResult('match-1',2,1);
  expect(supabase.rpc.mock.calls).toEqual([
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'start',p_team_id:null,p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'home_goal',p_team_id:'team-a',p_player_id:'player-a' }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'away_goal',p_team_id:'team-b',p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'home_undo',p_team_id:'team-a',p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'phase_half',p_team_id:null,p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'phase_second',p_team_id:null,p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'end',p_team_id:null,p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-2',p_action:'postpone',p_team_id:null,p_player_id:null }],
    ['hockey_control_match',{ p_match_id:'match-3',p_action:'cancel',p_team_id:null,p_player_id:null }],
    ['hockey_correct_result',{ p_match_id:'match-1',p_home_score:2,p_away_score:1 }]
  ]);
});

test('database rejection of a second live match is shown to the CMS caller', async () => {
  supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Another match is already live. End or postpone it before starting this match.' } });
  await expect(controlMatch('match-2','start')).rejects.toThrow('Another match is already live');
});

test('goal corrections send the selected goal, team and scorer to one database action', async () => {
  supabase.rpc.mockResolvedValue({ data: { id: 'match-1' }, error: null });
  await correctGoal('match-1', 'assign', 'goal-1', 'team-a', 'player-a');
  await correctGoal('match-1', 'remove', 'goal-2', 'team-b');
  await correctGoal('match-1', 'add', null, 'team-a');
  expect(supabase.rpc.mock.calls).toEqual([
    ['hockey_correct_goal', { p_match_id: 'match-1', p_action: 'assign', p_goal_id: 'goal-1', p_team_id: 'team-a', p_player_id: 'player-a' }],
    ['hockey_correct_goal', { p_match_id: 'match-1', p_action: 'remove', p_goal_id: 'goal-2', p_team_id: 'team-b', p_player_id: null }],
    ['hockey_correct_goal', { p_match_id: 'match-1', p_action: 'add', p_goal_id: null, p_team_id: 'team-a', p_player_id: null }]
  ]);
});

test('players can be created, edited and deleted', async () => {
  const chain = query({ id:'player-1' }); supabase.from.mockReturnValue(chain);
  await savePlayer({ season_id:'s',team_id:'t',name:'Player',shirt_number:7 });
  await savePlayer({ name:'Updated' },'player-1');
  await deletePlayer('player-1');
  expect(supabase.from.mock.calls.map(([name]) => name)).toEqual(['hockey_players','hockey_players','hockey_players']);
  expect(chain.insert).toHaveBeenCalledTimes(1);
  expect(chain.update).toHaveBeenCalledTimes(1);
  expect(chain.delete).toHaveBeenCalledTimes(1);
});

test('public data requests published announcements only; CMS can load drafts', async () => {
  const queries = [];
  supabase.from.mockImplementation((name) => {
    const chain = {
      select: jest.fn(() => chain), eq: jest.fn(() => chain),
      maybeSingle: jest.fn(async () => ({ data: { id:'season-1' }, error:null })),
      order: jest.fn(async () => ({ data: [], error:null }))
    };
    queries.push({ name, chain });
    return chain;
  });
  process.env.REACT_APP_SUPABASE_URL = 'https://example.supabase.co';
  process.env.REACT_APP_SUPABASE_ANON_KEY = 'test-key';
  await getSeasonData('anjk-3');
  const publicQuery = queries.find(({ name }) => name === 'hockey_announcements').chain;
  expect(publicQuery.eq).toHaveBeenCalledWith('is_published',true);
  queries.length = 0;
  await getSeasonData('anjk-3',true);
  const adminQuery = queries.find(({ name }) => name === 'hockey_announcements').chain;
  expect(adminQuery.eq).not.toHaveBeenCalledWith('is_published',true);
});
