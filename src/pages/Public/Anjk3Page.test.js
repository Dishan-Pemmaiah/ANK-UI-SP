import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Anjk3Page from './Anjk3Page';
import { getSeasonData } from '../../services/hockeyService';
import AuthContext from '../../context/AuthContext';

jest.mock('../../services/hockeyService', () => ({ getSeasonData: jest.fn() }));

const match = {
  id: 'match-1', status: 'Completed', stage: 'Group', pool: 'A',
  scheduled_at: '2026-09-14T10:00:00+05:30', home_score: 2, away_score: 1,
  home: { id: 'a', name: 'Alpha' }, away: { id: 'b', name: 'Bravo' }
};

test('calendar opens and Clear filters restores results and clears the date input', async () => {
  getSeasonData.mockResolvedValue({
    season: { id: 'season-1', name: 'ANJK 3' },
    teams: [{ id: 'a', name: 'Alpha', pool: 'A' }, { id: 'b', name: 'Bravo', pool: 'A' }],
    matches: [match], standings: [], announcements: [], players: [], events: []
  });
  render(<MemoryRouter initialEntries={['/anjk-3?tab=results']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter>);
  expect(await screen.findByText('Alpha')).toBeInTheDocument();
  const dateInput = screen.getByLabelText('Match date');
  dateInput.showPicker = jest.fn();
  fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(dateInput.showPicker).toHaveBeenCalledTimes(1);
  fireEvent.change(dateInput, { target: { value: '2026-09-15' } });
  expect(screen.getByText('No matches match these filters.')).toBeInTheDocument();
  expect(screen.getByText(/Filters: 2026-09-15/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByLabelText('Match date')).toHaveValue('');
  expect(screen.getByText('Showing all dates, pools and stages')).toBeInTheDocument();
  expect(screen.getByText('Alpha')).toBeInTheDocument();
});

test('shows saved season dates and only active live goals, with an admin control link', async () => {
  getSeasonData.mockResolvedValue({
    season: { id: 'season-1', name: 'ANJK 3', starts_at: '2026-12-22T18:30:00.000Z', ends_at: '2026-12-29T18:29:59.999Z', poster_url: '/anjk3/anjk3-poster.jpg' },
    teams: [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }], players: [], standings: [], announcements: [],
    matches: [{ ...match, status: 'Live' }],
    events: [
      { id: 'active', match_id: 'match-1', team_id: 'a', event_type: 'Goal', is_voided: false, created_at: '2026-12-23T06:30:00Z' },
      { id: 'voided', match_id: 'match-1', team_id: 'a', event_type: 'Goal', is_voided: true, created_at: '2026-12-23T06:29:00Z' },
      { id: 'removed', match_id: 'match-1', team_id: 'a', event_type: 'Goal Removed', created_at: '2026-12-23T06:28:00Z' }
    ]
  });
  render(<AuthContext.Provider value={{ isAdmin: true }}><MemoryRouter initialEntries={['/anjk-3?tab=live']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter></AuthContext.Provider>);
  expect(await screen.findByText(/23 Dec 2026.*29 Dec 2026/)).toBeInTheDocument();
  expect(screen.getByAltText('ANJK 3 poster')).toHaveAttribute('src', '/anjk3/anjk3-poster.jpg');
  expect(screen.getAllByText('Goal Alpha')).toHaveLength(1);
  expect(screen.queryByText(/Goal Removed|reversed/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Control Alpha vs Bravo in CMS' })).toHaveAttribute('href', '/admin/anjk-3?tab=match-control&match=match-1');
  expect(screen.getByRole('button', { name: 'Refresh tournament' })).toBeInTheDocument();
});

test('a match update is shown on a completed fixture and manual Refresh requests fresh data', async () => {
  getSeasonData.mockResolvedValue({
    season: { id: 'season-1', name: 'ANJK 3' }, teams: [match.home, match.away],
    matches: [{ ...match, match_note: 'Won in sudden death' }], standings: [], announcements: [], players: [], events: []
  });
  render(<MemoryRouter initialEntries={['/anjk-3?tab=results']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter>);
  expect(await screen.findByText('Match update: Won in sudden death')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh tournament' }));
  expect(getSeasonData).toHaveBeenCalledTimes(2);
});

test('knockout format hides Points Table, while league format keeps it', async () => {
  getSeasonData.mockResolvedValue({ season: { id: 's', name: 'Knockout', tournament_format: 'Knockout' }, teams: [], matches: [], rounds: [], standings: [], advancements: [], announcements: [], players: [], events: [] });
  const view = render(<MemoryRouter initialEntries={['/anjk-3?tab=points-table']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('tab', { name: 'Knockouts' })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('tab', { name: 'Points Table' })).not.toBeInTheDocument());
  view.unmount();
  getSeasonData.mockResolvedValue({ season: { id: 's', name: 'League', tournament_format: 'League' }, teams: [], matches: [], rounds: [], standings: [], advancements: [], announcements: [], players: [], events: [] });
  render(<MemoryRouter initialEntries={['/anjk-3?tab=points-table']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('tab', { name: 'Points Table' })).toBeInTheDocument();
});

test('Overview links to the latest published Draw / Ties and draft metadata is never displayed', async () => {
  getSeasonData.mockResolvedValue({ season:{id:'s',name:'ANJK 3'},teams:[],matches:[],rounds:[],standings:[],announcements:[],players:[],events:[],
    drawDocuments:[{id:'v2',title:'Revised official draw',version_number:2,is_current:true,is_published:true,updated_at:'2026-09-14T11:00:00Z',revision_note:'Tie 18 changed'},
      {id:'draft',title:'Secret draft',version_number:3,is_published:false}] });
  render(<MemoryRouter initialEntries={['/anjk-3']}><Routes><Route path="/anjk-3" element={<Anjk3Page />} /></Routes></MemoryRouter>);
  expect(await screen.findByText('Revised official draw')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'View Draw'})).toHaveAttribute('href','/anjk-3?tab=draw');
  expect(screen.getByText('Updated draw: Tie 18 changed')).toBeInTheDocument();
  expect(screen.queryByText('Secret draft')).not.toBeInTheDocument();
  expect(screen.getByRole('tab',{name:'Draw / Ties'})).toBeInTheDocument();
});
