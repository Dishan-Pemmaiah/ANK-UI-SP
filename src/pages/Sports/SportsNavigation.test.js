import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SportsPage from './SportsPage';
import AdminSports from '../Admin/AdminSports';
import sportsApi from '../../services/sportsService';

jest.mock('../../services/sportsService', () => ({ __esModule: true, default: { getTournaments: jest.fn() } }));

test('Sports pages retain section links and access to ANJK 3', () => {
  sportsApi.getTournaments.mockResolvedValue([]);
  const { container: publicContainer } = render(<MemoryRouter initialEntries={['/sports']}><SportsPage /></MemoryRouter>);
  expect(within(publicContainer).getByRole('link', { name: 'ANJK 3 Hockey' })).toHaveAttribute('href', '/anjk-3');
  expect(within(publicContainer).getByRole('link', { name: 'History' })).toHaveAttribute('href', '/sports/history');
  const { container: adminContainer } = render(<MemoryRouter initialEntries={['/admin/sports']}><AdminSports /></MemoryRouter>);
  expect(within(adminContainer).getByRole('link', { name: 'ANJK 3 Hockey' })).toHaveAttribute('href', '/admin/anjk-3');
  expect(within(adminContainer).getByRole('link', { name: 'History' })).toHaveAttribute('href', '/admin/sports/history');
});
