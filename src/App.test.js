import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicSidebar from './components/PublicSidebar';
import AdminSidebar from './components/AdminSidebar';

test('sidebars show one Sports entry instead of every Sports section', () => {
  const { container: publicContainer } = render(<MemoryRouter><PublicSidebar /></MemoryRouter>);
  expect(within(publicContainer).getByRole('link', { name: 'Sports' })).toHaveAttribute('href', '/sports');
  expect(within(publicContainer).getByRole('link', { name: 'ANK Kodava Hockey Namme 3' })).toHaveAttribute('href', '/anjk-3');
  const { container: adminContainer } = render(<MemoryRouter><AdminSidebar /></MemoryRouter>);
  expect(within(adminContainer).getByRole('link', { name: 'Sports' })).toHaveAttribute('href', '/admin/sports');
  expect(within(adminContainer).getByRole('link', { name: 'ANK Kodava Hockey Namme 3' })).toHaveAttribute('href', '/admin/anjk-3');
  expect(within(adminContainer).queryByRole('link', { name: 'Sports History' })).not.toBeInTheDocument();
});
