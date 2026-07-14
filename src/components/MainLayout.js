import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Drawer } from '@mui/material';
import Navbar from './Navbar';
import PublicSidebar from './PublicSidebar';
import SiteFooter from './SiteFooter';

const drawerWidth = 260;

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#0a0a0a'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#111111' }
          }}
        >
          <PublicSidebar mobile onNavigate={closeDrawer} />
        </Drawer>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <PublicSidebar />
        </Box>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 1, px: { xs: 2, md: 4 }, color: '#ffffff' }}>
          <Outlet />
          <SiteFooter />
        </Container>
      </Box>
    </>
  );
}
