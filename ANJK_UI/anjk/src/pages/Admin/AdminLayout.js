import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import AdminSidebar from '../../components/AdminSidebar';

const drawerWidth = 260;

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0d0d0d' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#111111' }
        }}
      >
        <AdminSidebar mobile onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <AdminSidebar />
      </Box>

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton color="inherit" onClick={toggleMobileDrawer} aria-label="Open admin menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Admin Menu</Typography>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
