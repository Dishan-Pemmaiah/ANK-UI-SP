import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton } from '@mui/material';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 260, bgcolor: '#111111' }
        }}
      >
        <AdminSidebar />
      </Drawer>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <AdminSidebar />
      </Box>

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, background: '#0d0d0d', minHeight: '100vh' }}>
        <IconButton onClick={handleToggle} sx={{ display: { xs: 'inline-flex', md: 'none' }, mb: 1, color: '#fff' }}>
          <MenuIcon />
        </IconButton>
        <Outlet />
      </Box>
    </Box>
  );
}
