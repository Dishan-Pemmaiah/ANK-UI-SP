import { getTournamentState } from './tournamentState';

const match = (id, status, scheduled_at, home_score = 0, away_score = 0) => ({ id, status, scheduled_at, home_score, away_score });

test('live match takes priority and next match ignores cancelled and postponed fixtures', () => {
  const now = new Date('2026-09-14T10:00:00+05:30');
  const state = getTournamentState([
    match('cancelled','Cancelled','2026-09-14T06:00:00+05:30'),
    match('postponed','Postponed','2026-09-14T07:00:00+05:30'),
    match('next','Upcoming','2026-09-15T10:00:00+05:30'),
    match('live','Live','2026-09-14T09:00:00+05:30')
  ], now);
  expect(state.live.id).toBe('live');
  expect(state.next.id).toBe('next');
  expect(state.today.map((item) => item.id)).toEqual(['live']);
  expect(state.tomorrow.map((item) => item.id)).toEqual(['next']);
});

test('before-start and after-day states follow fixture and result data', () => {
  const now = new Date('2026-09-14T20:00:00+05:30');
  expect(getTournamentState([match('next','Upcoming','2026-09-15T09:00:00+05:30')], now).beforeStart).toBe(true);
  const state = getTournamentState([
    match('played','Completed','2026-09-14T08:00:00+05:30',2,2),
    match('next','Upcoming','2026-09-15T09:00:00+05:30')
  ], now);
  expect(state.dayFinished).toBe(true);
  expect(state.results[0].id).toBe('played');
  expect(state.live).toBeNull();
});
