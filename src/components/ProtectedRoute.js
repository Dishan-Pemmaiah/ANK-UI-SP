import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const auth = useContext(AuthContext);

  if (!auth?.initialized) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && String(auth.user?.role || '').toLowerCase() !== String(requiredRole).toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
