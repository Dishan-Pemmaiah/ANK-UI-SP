import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Public/HomePage';
import AboutPage from './pages/Public/AboutPage';
import CommitteePage from './pages/Public/CommitteePage';
import ContactPage from './pages/Public/ContactPage';
import GalleryPage from './pages/Public/GalleryPage';
import NewsPage from './pages/Public/NewsPage';
import AchievementsPage from './pages/Public/AchievementsPage';
import HeritagePage from './pages/Public/HeritagePage';
import HallOfFamePage from './pages/Public/HallOfFamePage';
import VillagesPage from './pages/Public/VillagesPage';
import OkkaPage from './pages/Public/OkkaPage';
import HudikeriPage from './pages/Public/villagePages/HudikeriPage';
import KonageriPage from './pages/Public/villagePages/KonageriPage';
import HysudloorPage from './pages/Public/villagePages/HysudloorPage';
import BegurPage from './pages/Public/villagePages/BegurPage';
import MugutageriPage from './pages/Public/villagePages/MugutageriPage';
import NadikeriPage from './pages/Public/villagePages/NadikeriPage';
import ThuchamakeriPage from './pages/Public/villagePages/ThuchamakeriPage';
import ChikkamundurPage from './pages/Public/villagePages/ChikkamundurPage';
import BaliamandurPage from './pages/Public/villagePages/BaliamandurPage';
import RegisterPage from './pages/Membership/RegisterPage';
import LoginPage from './pages/Membership/LoginPage';
import ProfilePage from './pages/Membership/ProfilePage';
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from './pages/Events/EventDetailPage';
import EventFormPage from './pages/Events/EventFormPage';
import SportsPage from './pages/Sports/SportsPage';
import LivePage from './pages/Live/LivePage';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMembers from './pages/Admin/AdminMembers';
import AdminAbout from './pages/Admin/AdminAbout';
import AdminCommittee from './pages/Admin/AdminCommittee';
import AdminHeritage from './pages/Admin/AdminHeritage';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminSports from './pages/Admin/AdminSports';
import AdminNews from './pages/Admin/AdminNews';
import AdminGallery from './pages/Admin/AdminGallery';
import AdminLive from './pages/Admin/AdminLive';
import AdminAchievements from './pages/Admin/AdminAchievements';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import './AppTheme.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#b30000'
    },
    background: {
      default: '#0a0a0a',
      paper: '#141414'
    },
    text: {
      primary: '#ffffff',
      secondary: '#d1d1d1'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0a',
          color: '#ffffff'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AuthProvider>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="committee" element={<CommitteePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="heritage" element={<HeritagePage />} />
            <Route path="hall-of-fame" element={<HallOfFamePage />} />
            <Route path="villages" element={<VillagesPage />} />
            <Route path="okka" element={<OkkaPage />} />
            <Route path="villages/hudikeri" element={<HudikeriPage />} />
            <Route path="villages/konageri" element={<KonageriPage />} />
            <Route path="villages/hysudloor" element={<HysudloorPage />} />
            <Route path="villages/begur" element={<BegurPage />} />
            <Route path="villages/mugutageri" element={<MugutageriPage />} />
            <Route path="villages/nadikeri" element={<NadikeriPage />} />
            <Route path="villages/thuchamakeri" element={<ThuchamakeriPage />} />
            <Route path="villages/chikkamundur" element={<ChikkamundurPage />} />
            <Route path="villages/baliamandur" element={<BaliamandurPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="sports" element={<SportsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/create" element={<ProtectedRoute requiredRole="Admin"><EventFormPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="live" element={<LivePage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="admin" element={<ProtectedRoute requiredRole="Admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="committee" element={<AdminCommittee />} />
              <Route path="heritage" element={<AdminHeritage />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="sports" element={<AdminSports />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="live" element={<AdminLive />} />
              <Route path="achievements" element={<AdminAchievements />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
