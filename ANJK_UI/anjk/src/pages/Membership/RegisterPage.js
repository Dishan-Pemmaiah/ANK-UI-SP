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
    <Box>
      <Typography variant="h4" gutterBottom>
        Member Registration
      </Typography>
      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Full Name" fullWidth margin="normal" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <TextField label="Email" type="email" fullWidth margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextField label="Password" type="password" fullWidth margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>Register</Button>
        </Box>
      </Paper>
    </Box>
  );
}
