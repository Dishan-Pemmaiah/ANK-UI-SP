import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomeTournament from './HomeTournament';
import { getSeasonData } from '../services/hockeyService';

jest.mock('../services/hockeyService', () => ({ getSeasonData: jest.fn() }));

const teams = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }];
const fixture = (status) => ({ id:'match-1', status, scheduled_at:'2026-09-15T10:00:00+05:30', home:teams[0], away:teams[1], home_score:2, away_score:1, stage:'Group' });
const renderPanel = () => render(<MemoryRouter><HomeTournament /></MemoryRouter>);

afterEach(() => jest.clearAllMocks());

test('Home promotes live score and match link', async () => {
  getSeasonData.mockResolvedValue({ season:{ name:'ANJK 3' }, matches:[fixture('Live')], standings:[] });
  renderPanel();
  expect(await screen.findByText('● LIVE NOW')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore ANJK 3 tournament' })).toHaveAttribute('href', '/anjk-3');
  expect(screen.getByRole('link', { name: '● LIVE NOW' })).toHaveAttribute('href', '/anjk-3?tab=live#match-match-1');
  expect(screen.getByText('2 – 1')).toBeInTheDocument();
  expect(screen.getByRole('link', { name:'View Match' })).toHaveAttribute('href','/anjk-3?tab=live#match-match-1');
});

test('Home shows next match when no match is live', async () => {
  getSeasonData.mockResolvedValue({ season:{ name:'ANJK 3' }, matches:[fixture('Upcoming')], standings:[] });
  renderPanel();
  expect(await screen.findByText('NEXT MATCH')).toBeInTheDocument();
  expect(screen.queryByText('● LIVE NOW')).not.toBeInTheDocument();
});

test('Home promotes latest result after the day finishes', async () => {
  getSeasonData.mockResolvedValue({ season:{ name:'ANJK 3' }, matches:[fixture('Completed')], standings:[] });
  renderPanel();
  expect(await screen.findByText('LATEST RESULT')).toBeInTheDocument();
  expect(screen.queryByText('NEXT MATCH')).not.toBeInTheDocument();
});

test('clicking the Home poster opens ANJK 3 while Explore remains a link', async () => {
  getSeasonData.mockResolvedValue({ season: { name: 'ANJK 3', poster_url: '/anjk3/anjk3-poster.jpg', starts_at: '2026-12-23T00:00:00+05:30' }, matches: [], standings: [] });
  render(<MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<HomeTournament />} /><Route path="/anjk-3" element={<div>Tournament destination</div>} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/anjk-3');
  fireEvent.click(screen.getByAltText('ANJK 3 poster'));
  expect(await screen.findByText('Tournament destination')).toBeInTheDocument();
});

test('Home keeps its match sections but omits points for knockout format', async () => {
  getSeasonData.mockResolvedValue({ season: { name: 'Knockout', tournament_format: 'Knockout' }, matches: [fixture('Completed')], standings: [{ team_id: 'a', team_name: 'Alpha', played: 1, points: 3, goal_difference: 1 }] });
  renderPanel();
  expect(await screen.findByText('LATEST RESULT')).toBeInTheDocument();
  expect(screen.queryByText('Points Table')).not.toBeInTheDocument();
});
