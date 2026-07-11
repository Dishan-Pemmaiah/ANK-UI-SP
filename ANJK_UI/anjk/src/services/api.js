const API_BASE = process.env.REACT_APP_API_BASE || 'https://example.com/api';

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

export function getEvents() {
  return fetchJson('/events').catch(() => [
    { id: 1, name: 'Village Sports Festival', description: 'Paid football and kabaddi tournament.', date: '2026-10-05', fee: '₹250', type: 'paid', location: 'Anjigeri Ground' },
    { id: 2, name: 'Host a Community Match', description: 'Local club match with free entry for supporters.', date: '2026-10-12', fee: 'Free', type: 'hosted', location: 'Community Stadium' },
  ]);
}

export function getLiveStatus() {
  return fetchJson('/live').catch(() => ({
    title: 'No live match currently',
    description: 'Check back later for live match updates and scoreboards.',
    teamA: 'Anjigeri Stars',
    teamB: 'Guest Team',
    scoreA: '-',
    scoreB: '-',
    liveStatus: 'Waiting for next match',
  }));
}

export function getMembers() {
  return fetchJson('/members').catch(() => ([
    { id: 1, name: 'Rahul', role: 'Captain', sport: 'Football' },
    { id: 2, name: 'Meera', role: 'Coach', sport: 'Kabaddi' },
    { id: 3, name: 'Suresh', role: 'Member', sport: 'Track & Field' },
  ]));
}
