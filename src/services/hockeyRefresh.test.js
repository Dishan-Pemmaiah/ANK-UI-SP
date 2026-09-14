import { hockeyRefreshDelay } from './hockeyRefresh';

test('live matches refresh in 10 seconds; waiting and completed fixtures in 30 seconds', () => {
  expect(hockeyRefreshDelay([{ status: 'Live' }])).toBe(10000);
  expect(hockeyRefreshDelay([{ status: 'Upcoming' }])).toBe(30000);
  expect(hockeyRefreshDelay([{ status: 'Completed' }])).toBe(30000);
  expect(hockeyRefreshDelay()).toBe(30000);
});
