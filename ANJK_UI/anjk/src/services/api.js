import { getApiBase } from '../config/apiBase';

const API_BASE = getApiBase();

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
