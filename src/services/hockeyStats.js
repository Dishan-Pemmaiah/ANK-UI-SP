export const getHockeyStats = (matches = [], events = [], teams = [], players = []) => {
  const completed = matches.filter((match) => match.status === 'Completed');
  const teamGoals = new Map(teams.map((team) => [team.id, { team, goals: 0, wins: 0 }]));
  completed.forEach((match) => {
    const home = teamGoals.get(match.home_team_id);
    const away = teamGoals.get(match.away_team_id);
    if (home) { home.goals += match.home_score; home.wins += Number(match.home_score > match.away_score); }
    if (away) { away.goals += match.away_score; away.wins += Number(match.away_score > match.home_score); }
  });
  const completedIds = new Set(completed.map((match) => match.id));
  const playerGoals = new Map();
  events.filter((event) => event.event_type === 'Goal' && !event.is_voided && event.player_id && completedIds.has(event.match_id))
    .forEach((event) => playerGoals.set(event.player_id, (playerGoals.get(event.player_id) || 0) + 1));
  const topScorers = [...playerGoals].map(([id, goals]) => ({ player: players.find((player) => player.id === id), goals }))
    .filter(({ player }) => player).sort((a, b) => b.goals - a.goals || a.player.name.localeCompare(b.player.name));
  const teamRows = [...teamGoals.values()];
  return {
    matchesPlayed: completed.length,
    totalGoals: completed.reduce((sum, match) => sum + match.home_score + match.away_score, 0),
    topScorers,
    teamGoals: teamRows.filter((row) => row.goals > 0).sort((a, b) => b.goals - a.goals || a.team.name.localeCompare(b.team.name)),
    mostWins: teamRows.filter((row) => row.wins > 0).sort((a, b) => b.wins - a.wins || a.team.name.localeCompare(b.team.name))
  };
};
