import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TournamentBanner from './TournamentBanner';
import { getSeasonData } from '../services/hockeyService';

jest.mock('../services/hockeyService', () => ({ getSeasonData: jest.fn() }));

afterEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

test('TournamentBanner displays upcoming countdown when before start', async () => {
  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: '2026-12-23T00:00:00+05:30' },
    matches: []
  });

  render(
    <MemoryRouter initialEntries={['/']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(await screen.findByText('ANJK 3')).toBeInTheDocument();
  expect(screen.getByText(/Starts in/i)).toBeInTheDocument();
  expect(screen.getByText(/View/i)).toBeInTheDocument();
});

test('TournamentBanner displays LIVE match when match is live', async () => {
  const match = {
    id: 'm1',
    status: 'Live',
    home: { name: 'Koppa' },
    away: { name: 'Hudikeri' },
    home_score: 2,
    away_score: 1,
    scheduled_at: '2026-12-23T10:00:00+05:30'
  };

  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: '2026-12-23T00:00:00+05:30' },
    matches: [match]
  });

  render(
    <MemoryRouter initialEntries={['/']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Koppa vs Hudikeri/i)).toBeInTheDocument();
  expect(screen.getByText('2 – 1')).toBeInTheDocument();
  expect(screen.getByText(/Watch Live/i)).toBeInTheDocument();
});

test('TournamentBanner dismisses when close icon is clicked', async () => {
  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: '2026-12-23T00:00:00+05:30' },
    matches: []
  });

  render(
    <MemoryRouter initialEntries={['/']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(await screen.findByText('ANJK 3')).toBeInTheDocument();
  const dismissButton = screen.getByRole('button', { name: /Dismiss tournament banner/i });
  fireEvent.click(dismissButton);

  expect(screen.queryByText('ANJK 3')).not.toBeInTheDocument();
  expect(sessionStorage.getItem('ank_tournament_banner_dismissed')).toBe('1');
});

test('TournamentBanner automatically displays Day 1 on opening day', async () => {
  // Use current date as starts_at
  const today = new Date().toISOString();
  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: today, ends_at: '2026-12-30T00:00:00+05:30' },
    matches: []
  });

  render(
    <MemoryRouter initialEntries={['/']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(await screen.findByText('ANJK 3')).toBeInTheDocument();
  expect(screen.getByText(/Day 1 · Starts today!/i)).toBeInTheDocument();
});

test('TournamentBanner automatically displays Day 2 on second day', async () => {
  // Started yesterday
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString();
  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: yesterday, ends_at: nextWeek },
    matches: []
  });

  render(
    <MemoryRouter initialEntries={['/']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(await screen.findByText('ANJK 3')).toBeInTheDocument();
  expect(screen.getByText('Day 2')).toBeInTheDocument();
});

test('TournamentBanner automatically displays Final Day on the last day', async () => {
  // Started 6 days ago, ends today
  const sixDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString();
  const today = new Date().toISOString();
  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: sixDaysAgo, ends_at: today },
    matches: []
  });

  render(
    <MemoryRouter initialEntries={['/']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(await screen.findByText('ANJK 3')).toBeInTheDocument();
  expect(screen.getByText(/Final Day/i)).toBeInTheDocument();
});

test('TournamentBanner is hidden when on /anjk-3 route', async () => {
  getSeasonData.mockResolvedValue({
    season: { name: 'ANJK 3', starts_at: '2026-12-23T00:00:00+05:30' },
    matches: []
  });

  render(
    <MemoryRouter initialEntries={['/anjk-3']}>
      <TournamentBanner />
    </MemoryRouter>
  );

  expect(screen.queryByText('ANJK 3')).not.toBeInTheDocument();
});
