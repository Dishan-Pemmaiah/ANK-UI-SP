import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 3, background: '#0d0d0d', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
