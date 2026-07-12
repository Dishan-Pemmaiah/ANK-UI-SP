const API_BASE = process.env.REACT_APP_API_BASE || 'https://example.com/api';

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

export function getEvents() {
  return fetchJson('/events');
}

export function getLiveStatus() {
  return fetchJson('/live');
}

export function getMembers() {
  return fetchJson('/members');
}
