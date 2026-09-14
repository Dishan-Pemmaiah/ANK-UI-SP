export const sortMatches = (matches) => [...matches].sort((a, b) =>
  new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

export const tournamentDayKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

export const getTournamentState = (matches = [], now = new Date()) => {
  const ordered = sortMatches(matches);
  const today = tournamentDayKey(now);
  const tomorrow = tournamentDayKey(new Date(now.getTime() + 86400000));
  const live = ordered.find((match) => match.status === 'Live') || null;
  const upcoming = ordered.filter((match) => match.status === 'Upcoming');
  const completed = ordered.filter((match) => match.status === 'Completed').reverse();
  return {
    live,
    next: upcoming[0] || null,
    today: ordered.filter((match) => tournamentDayKey(new Date(match.scheduled_at)) === today && !['Cancelled', 'Postponed'].includes(match.status)),
    tomorrow: upcoming.filter((match) => tournamentDayKey(new Date(match.scheduled_at)) === tomorrow),
    results: completed,
    beforeStart: !live && completed.length === 0 && Boolean(upcoming.length),
    dayFinished: !live && !upcoming.some((match) => tournamentDayKey(new Date(match.scheduled_at)) === today) && completed.some((match) => tournamentDayKey(new Date(match.scheduled_at)) === today)
  };
};

export const fixtureLabel = (match) => [match.stage, match.pool ? `Pool ${match.pool}` : null].filter(Boolean).join(' · ');
