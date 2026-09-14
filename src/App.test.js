import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicSidebar from './components/PublicSidebar';

test('ANJK 3 is a single main-menu destination while Sports remains available', () => {
  render(<MemoryRouter><PublicSidebar /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'ANJK 3' })).toHaveAttribute('href', '/anjk-3');
  expect(screen.getByRole('link', { name: 'Sports' })).toHaveAttribute('href', '/sports');
});
