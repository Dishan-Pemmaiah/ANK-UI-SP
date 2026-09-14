export const hockeyRefreshDelay = (matches = []) => matches.some((match) => match.status === 'Live') ? 10000 : 30000;
