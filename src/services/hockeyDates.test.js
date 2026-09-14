import { formatSeasonDates, istDateToIso, istLocalDateTimeToIso, toIstDate, toIstLocalDateTime } from './hockeyDates';

test('tournament date-only values round trip through IST timestamps', () => {
  const starts = istDateToIso('2026-10-20');
  const ends = istDateToIso('2026-10-22', true);
  expect(starts).toBe('2026-10-19T18:30:00.000Z');
  expect(ends).toBe('2026-10-22T18:29:59.999Z');
  expect(toIstDate(starts)).toBe('2026-10-20');
  expect(toIstDate(ends)).toBe('2026-10-22');
});

test('fixture date-time remains editable and converts only on save', () => {
  expect(toIstLocalDateTime('2026-10-20T12:30')).toBe('2026-10-20T12:30');
  expect(istLocalDateTimeToIso('2026-10-20T12:30')).toBe('2026-10-20T07:00:00.000Z');
  expect(toIstLocalDateTime('2026-10-20T07:00:00.000Z')).toBe('2026-10-20T12:30');
});

test('invalid dates are rejected before sending to Supabase', () => {
  expect(() => istDateToIso('2026-02-30')).toThrow('valid tournament date');
  expect(() => istLocalDateTimeToIso('2026-10-20T25:00')).toThrow('valid fixture date');
});

test('saved tournament dates display in India time on public pages', () => {
  expect(formatSeasonDates('2026-12-22T18:30:00.000Z', '2026-12-29T18:29:59.999Z')).toBe('23 Dec 2026 – 29 Dec 2026');
});
