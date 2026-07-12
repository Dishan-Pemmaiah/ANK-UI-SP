import { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/authService';
import AuthContext from '../../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await authApi.login(form);
      await auth.login(result.token, { fullName: result.fullName, role: result.role });
      navigate('/profile');
    } catch (err) {
      const message = err?.response?.data?.title || err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 8, backgroundColor: '#07090d', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 560, px: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#ffffff' }}>
          Login
        </Typography>
        <Paper sx={{ p: 4, backgroundColor: '#11151d', border: '1px solid rgba(255,255,255,0.12)' }} elevation={6}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              InputLabelProps={{ sx: { color: '#c4cdd8' } }}
              InputProps={{ sx: { backgroundColor: '#0d1218', color: '#ffffff' } }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              InputLabelProps={{ sx: { color: '#c4cdd8' } }}
              InputProps={{ sx: { backgroundColor: '#0d1218', color: '#ffffff' } }}
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Button type="submit" variant="contained" sx={{ mt: 3, width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
