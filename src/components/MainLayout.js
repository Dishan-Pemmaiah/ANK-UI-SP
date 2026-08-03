import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer } from '@mui/material';
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
          alignItems: 'stretch',
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

        <Box sx={{ display: { xs: 'none', md: 'block' }, alignSelf: 'stretch' }}>
          <PublicSidebar />
        </Box>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
          <Box
            component="main"
            sx={{
              mt: { xs: 3, md: 4 },
              mb: { xs: 2, md: 3 },
              px: { xs: 2, md: 3, lg: 4 },
              color: '#ffffff',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}
          >
            <Box
              sx={{
                flex: 1,
                pb: { xs: 2, md: 3 },
                width: '100%',
                maxWidth: 1320,
                mx: 'auto'
              }}
            >
              <Outlet />
            </Box>
          </Box>
          <SiteFooter />
        </Box>
      </Box>
    </>
  );
}
