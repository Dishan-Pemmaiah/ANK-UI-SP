import { supabase } from './supabaseClient';

const ensureSupabaseConfigured = () => {
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  }
};

const unwrap = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};
const table = (name) => supabase.from(name);

export const getSeason = async (slug = 'anjk-3') => {
  ensureSupabaseConfigured();
  return unwrap(await table('hockey_seasons').select('*').eq('slug', slug).maybeSingle());
};

export const getSeasonData = async (slug = 'anjk-3', includeDrafts = false) => {
  const season = await getSeason(slug);
  if (!season) return { season: null, teams: [], matches: [], standings: [], announcements: [], players: [], events: [] };
  const id = season.id;
  const [teams, matches, standings, announcements, players, events] = await Promise.all([
    table('hockey_teams').select('*').eq('season_id', id).order('name'),
    table('hockey_matches').select('*, home:hockey_teams!hockey_matches_home_team_id_fkey(id,name,logo_url,pool), away:hockey_teams!hockey_matches_away_team_id_fkey(id,name,logo_url,pool)').eq('season_id', id).order('scheduled_at'),
    table('hockey_standings').select('*').eq('season_id', id).order('points', { ascending: false }),
    (includeDrafts
      ? table('hockey_announcements').select('*').eq('season_id', id)
      : table('hockey_announcements').select('*').eq('season_id', id).eq('is_published', true)
    ).order('created_at', { ascending: false }),
    table('hockey_players').select('*').eq('season_id', id).order('name'),
    table('hockey_match_events').select('*').eq('season_id', id).order('created_at', { ascending: false })
  ]);
  return { season, teams: unwrap(teams), matches: unwrap(matches), standings: unwrap(standings), announcements: unwrap(announcements), players: unwrap(players), events: unwrap(events) };
};

export const saveSeason = async (payload, id) => unwrap(await (id
  ? table('hockey_seasons').update(payload).eq('id', id).select('*').single()
  : table('hockey_seasons').insert(payload).select('*').single()));
export const saveTeam = async (payload, id) => unwrap(await (id
  ? table('hockey_teams').update(payload).eq('id', id).select('*').single()
  : table('hockey_teams').insert(payload).select('*').single()));
export const deleteTeam = async (id) => unwrap(await table('hockey_teams').delete().eq('id', id));
export const savePlayer = async (payload, id) => unwrap(await (id
  ? table('hockey_players').update(payload).eq('id', id).select('*').single()
  : table('hockey_players').insert(payload).select('*').single()));
export const deletePlayer = async (id) => unwrap(await table('hockey_players').delete().eq('id', id));
export const saveMatch = async (payload, id) => unwrap(await (id
  ? table('hockey_matches').update(payload).eq('id', id).select('*').single()
  : table('hockey_matches').insert(payload).select('*').single()));
export const saveAnnouncement = async (payload, id) => unwrap(await (id
  ? table('hockey_announcements').update(payload).eq('id', id).select('*').single()
  : table('hockey_announcements').insert(payload).select('*').single()));
export const deleteAnnouncement = async (id) => unwrap(await table('hockey_announcements').delete().eq('id', id));

export const controlMatch = async (matchId, action, teamId = null, playerId = null) => unwrap(await supabase.rpc('hockey_control_match', {
  p_match_id: matchId, p_action: action, p_team_id: teamId, p_player_id: playerId
}));
export const correctResult = async (matchId, homeScore, awayScore) => unwrap(await supabase.rpc('hockey_correct_result', {
  p_match_id: matchId, p_home_score: Number(homeScore), p_away_score: Number(awayScore)
}));
