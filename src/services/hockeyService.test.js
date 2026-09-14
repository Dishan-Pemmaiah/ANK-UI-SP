import { controlMatch, correctResult, saveMatch, saveSeason, saveTeam } from './hockeyService';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn(), rpc: jest.fn() } }));

const query = (value) => {
  const result = { data: value, error: null };
  const chain = { insert: jest.fn(), update: jest.fn(), eq: jest.fn(), select: jest.fn(), single: jest.fn().mockResolvedValue(result) };
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

test('start, score, end, and correction call admin-only database actions', async () => {
  supabase.rpc.mockResolvedValue({ data: { id:'match-1' }, error:null });
  await controlMatch('match-1','start');
  await controlMatch('match-1','home_goal','team-a');
  await controlMatch('match-1','end');
  await correctResult('match-1',2,1);
  expect(supabase.rpc.mock.calls).toEqual([
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'start',p_team_id:null }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'home_goal',p_team_id:'team-a' }],
    ['hockey_control_match',{ p_match_id:'match-1',p_action:'end',p_team_id:null }],
    ['hockey_correct_result',{ p_match_id:'match-1',p_home_score:2,p_away_score:1 }]
  ]);
});
