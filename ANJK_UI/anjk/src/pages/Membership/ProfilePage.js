import { useContext, useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import AuthContext from '../../context/AuthContext';
import authApi from '../../services/authService';

export default function ProfilePage() {
  const auth = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = async () => {
    setError('');
    try {
      const data = await authApi.getProfile();
      setProfile(data);
      setName(data.fullName);
    } catch (err) {
      const messageText = err?.response?.data?.title || err?.response?.data?.message || err?.message || 'Unable to load profile details.';
      setError(messageText);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    const updated = await authApi.updateProfile({ fullName: name });
    setProfile(updated);
    auth?.updateUser?.({ ...auth.user, fullName: updated.fullName, role: updated.role });
    setMessage('Profile updated successfully.');
  };

  if (!profile) {
    return (
      <Box>
        <Typography>{error ? 'Unable to load profile.' : 'Loading profile...'}</Typography>
        {error ? (
          <Box sx={{ mt: 2 }}>
            <Typography color="error" sx={{ mb: 1.5 }}>{error}</Typography>
            <Button variant="contained" onClick={loadProfile}>Retry</Button>
            <Button sx={{ ml: 2 }} variant="outlined" onClick={auth?.logout}>Logout</Button>
          </Box>
        ) : null}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Member Profile
      </Typography>
      <Paper sx={{ p: 4, maxWidth: 700 }}>
        <Typography variant="h6">{profile.fullName}</Typography>
        <Typography>Email: {profile.email}</Typography>
        <Typography>Role: {profile.role}</Typography>
        <Typography>Membership Status: {profile.membershipStatus}</Typography>
        <Typography>Expires: {new Date(profile.membershipExpires).toLocaleDateString()}</Typography>

        <Box sx={{ mt: 3 }}>
          <TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpdate}>
            Update Profile
          </Button>
          {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
        </Box>
      </Paper>
    </Box>
  );
}
