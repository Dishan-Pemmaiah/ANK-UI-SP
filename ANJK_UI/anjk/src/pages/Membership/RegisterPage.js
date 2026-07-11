import { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/authService';
import AuthContext from '../../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await authApi.register({ ...form, role: 'Member' });
      await auth.login(result.token, { fullName: result.fullName, role: result.role });
      navigate('/profile');
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 8, backgroundColor: '#07090d', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 560, px: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#ffffff' }}>
          Member Registration
        </Typography>
        <Paper sx={{ p: 4, backgroundColor: '#11151d', border: '1px solid rgba(255,255,255,0.12)' }} elevation={6}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              autoComplete="name"
              InputLabelProps={{ sx: { color: '#c4cdd8' } }}
              InputProps={{ sx: { backgroundColor: '#0d1218', color: '#ffffff' } }}
            />
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
              autoComplete="new-password"
              InputLabelProps={{ sx: { color: '#c4cdd8' } }}
              InputProps={{ sx: { backgroundColor: '#0d1218', color: '#ffffff' } }}
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Button type="submit" variant="contained" sx={{ mt: 3, width: '100%' }}>
              Register
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
