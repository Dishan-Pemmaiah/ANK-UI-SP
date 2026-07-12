const LOCAL_API_BASE = 'http://localhost:41809/api';
const PRODUCTION_API_BASE = 'https://anjk.onrender.com/api';

const trimTrailingSlash = (value) => value.replace(/\/$/, '');

export function getApiBase() {
  const configuredBase = process.env.REACT_APP_API_BASE?.trim();

  if (configuredBase) {
    return trimTrailingSlash(configuredBase);
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_API_BASE;
    }
  }

  return PRODUCTION_API_BASE;
}

export function getHubBase() {
  const apiBase = getApiBase();
  return apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
}