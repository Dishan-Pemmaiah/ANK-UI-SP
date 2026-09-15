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
  if (!season) return { season: null, teams: [], matches: [], rounds: [], advancements: [], standings: [], announcements: [], players: [], events: [], drawDocuments: [] };
  const id = season.id;
  const [teams, matches, rounds, advancements, standings, announcements, players, events, drawDocuments] = await Promise.all([
    table('hockey_teams').select('*').eq('season_id', id).order('name'),
    table('hockey_matches').select('*, home:hockey_teams!hockey_matches_home_team_id_fkey(id,name,logo_url,pool), away:hockey_teams!hockey_matches_away_team_id_fkey(id,name,logo_url,pool)').eq('season_id', id).order('scheduled_at'),
    table('hockey_rounds').select('*').eq('season_id', id).order('sort_order'),
    table('hockey_advancements').select('*').eq('season_id', id).order('created_at', { ascending: false }),
    table('hockey_standings').select('*').eq('season_id', id).order('points', { ascending: false }),
    (includeDrafts
      ? table('hockey_announcements').select('*').eq('season_id', id)
      : table('hockey_announcements').select('*').eq('season_id', id).eq('is_published', true)
    ).order('created_at', { ascending: false }),
    table('hockey_players').select('*').eq('season_id', id).order('name'),
    table('hockey_match_events').select('*').eq('season_id', id).order('created_at', { ascending: false }),
    (includeDrafts ? table('hockey_tournament_documents').select('*').eq('season_id',id).eq('document_type','DrawTies')
      : table('hockey_tournament_documents').select('*').eq('season_id',id).eq('document_type','DrawTies').eq('is_published',true))
      .order('version_number',{ ascending:false })
  ]);
  const rawMatches = unwrap(matches);
  const roundNames = new Map(unwrap(rounds).map((round) => [round.id, round.name]));
  const labels = new Map(rawMatches.map((match, index) => [match.id, match.match_number ? `Match ${match.match_number}` : match.round_label || `Match ${index + 1}`]));
  const labeledMatches = rawMatches.map((match) => ({ ...match,
    display_label: labels.get(match.id),
    round_name: roundNames.get(match.round_id),
    home_slot_label: match.home_source_match_id ? `Winner of ${labels.get(match.home_source_match_id) || 'another match'}` : 'TBD',
    away_slot_label: match.away_source_match_id ? `Winner of ${labels.get(match.away_source_match_id) || 'another match'}` : 'TBD'
  }));
  return { season, teams: unwrap(teams), matches: labeledMatches, rounds: unwrap(rounds), advancements: unwrap(advancements), standings: unwrap(standings), announcements: unwrap(announcements), players: unwrap(players), events: unwrap(events), drawDocuments: unwrap(drawDocuments) };
};

export const saveSeason = async (payload, id) => unwrap(await (id
  ? table('hockey_seasons').update(payload).eq('id', id).select('*').single()
  : table('hockey_seasons').insert(payload).select('*').single()));
export const saveTeam = async (payload, id) => unwrap(await (id
  ? table('hockey_teams').update(payload).eq('id', id).select('*').single()
  : table('hockey_teams').insert(payload).select('*').single()));
export const deleteTeam = async (id) => unwrap(await table('hockey_teams').delete().eq('id', id));
export const saveRound = async (payload, id) => unwrap(await (id
  ? table('hockey_rounds').update(payload).eq('id', id).select('*').single()
  : table('hockey_rounds').insert(payload).select('*').single()));
export const deleteRound = async (id) => unwrap(await table('hockey_rounds').delete().eq('id', id));
export const savePlayer = async (payload, id) => unwrap(await (id
  ? table('hockey_players').update(payload).eq('id', id).select('*').single()
  : table('hockey_players').insert(payload).select('*').single()));
export const deletePlayer = async (id) => unwrap(await table('hockey_players').delete().eq('id', id));
export const saveMatch = async (payload, id) => unwrap(await (id
  ? table('hockey_matches').update(payload).eq('id', id).select('*').single()
  : table('hockey_matches').insert(payload).select('*').single()));
export const deleteMatch = async (id) => unwrap(await supabase.rpc('hockey_delete_match', { p_match_id: id }));
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
export const correctGoal = async (matchId, action, goalId = null, teamId = null, playerId = null) => unwrap(await supabase.rpc('hockey_correct_goal', {
  p_match_id: matchId, p_action: action, p_goal_id: goalId, p_team_id: teamId, p_player_id: playerId || null
}));
export const completeKnockoutMatch = async (id, winnerId, method, shootoutHome = null, shootoutAway = null) => unwrap(await supabase.rpc('hockey_complete_knockout_match', {
  p_match_id: id, p_winner_team_id: winnerId, p_decision_method: method,
  p_shootout_home: shootoutHome === '' ? null : shootoutHome, p_shootout_away: shootoutAway === '' ? null : shootoutAway
}));
export const setKnockoutWinner = async (id, winnerId, method, shootoutHome = null, shootoutAway = null) => unwrap(await supabase.rpc('hockey_set_knockout_winner', {
  p_match_id: id, p_winner_team_id: winnerId, p_decision_method: method,
  p_shootout_home: shootoutHome === '' ? null : shootoutHome, p_shootout_away: shootoutAway === '' ? null : shootoutAway
}));
export const correctKnockoutResult = async (id, homeScore, awayScore, winnerId, method, shootoutHome = null, shootoutAway = null) => unwrap(await supabase.rpc('hockey_correct_knockout_result', {
  p_match_id: id, p_home_score: Number(homeScore), p_away_score: Number(awayScore),
  p_winner_team_id: winnerId, p_decision_method: method,
  p_shootout_home: shootoutHome === '' ? null : shootoutHome,
  p_shootout_away: shootoutAway === '' ? null : shootoutAway
}));
export const setProgression = async (sourceId, targetId, slot, automatic = false) => unwrap(await supabase.rpc('hockey_set_progression', {
  p_source_match_id: sourceId, p_target_match_id: targetId || null, p_slot: slot || null, p_automatic: automatic
}));
export const advanceWinner = async (sourceId, targetId, slot) => unwrap(await supabase.rpc('hockey_advance_winner', {
  p_source_match_id: sourceId, p_target_match_id: targetId, p_slot: slot
}));
export const assignBye = async (teamId, targetId, slot, note = '') => unwrap(await supabase.rpc('hockey_assign_bye', {
  p_team_id: teamId, p_target_match_id: targetId, p_slot: slot, p_note: note
}));
export const removeAdvancement = async (id) => unwrap(await supabase.rpc('hockey_remove_advancement', { p_advancement_id: id }));
