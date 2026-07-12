import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Grid, TextField, Button, MenuItem } from '@mui/material';
import memberApi from '../../services/memberService';

const emptyMember = {
  fullName: '',
  email: '',
  password: '',
  role: 'General Public',
  membershipStatus: 'Active',
  membershipExpires: new Date().toISOString().slice(0, 10)
};

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    setLoading(true);
    memberApi.getAll()
      .then((data) => setMembers(data))
      .catch((error) => console.error('Failed to load members', error))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyMember);
  };

  const startEdit = async (member) => {
    const detail = await memberApi.getById(member.id);
    setSelectedMember(detail);
    setEditingId(detail.id);
    setForm({
      fullName: detail.fullName || '',
      email: detail.email || '',
      password: '',
      role: detail.role || 'General Public',
      membershipStatus: detail.membershipStatus || 'Active',
      membershipExpires: detail.membershipExpires ? new Date(detail.membershipExpires).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        membershipStatus: form.membershipStatus,
        membershipExpires: new Date(form.membershipExpires).toISOString(),
        password: form.password
      };

      const saved = editingId ? await memberApi.update(editingId, payload) : await memberApi.create(payload);
      setMembers((prev) => editingId ? prev.map((item) => (item.id === editingId ? saved : item)) : [saved, ...prev]);
      setSelectedMember(saved);
      resetForm();
    } catch (error) {
      console.error('Failed to save member', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await memberApi.delete(id);
    setMembers((prev) => prev.filter((item) => item.id !== id));
    if (selectedMember?.id === id) {
      setSelectedMember(null);
    }
    if (editingId === id) {
      resetForm();
    }
  };

  const handleApproveAdmin = async (id) => {
    const updated = await memberApi.approveAdmin(id);
    setMembers((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setSelectedMember(updated);
    if (editingId === id) {
      setForm((prev) => ({ ...prev, role: 'Admin' }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Members</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Registered User' : 'Add Registered User'}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} helperText={editingId ? 'Leave empty to keep the current password' : ''} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <MenuItem value="General Public">General Public</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Membership Status" value={form.membershipStatus} onChange={(e) => setForm({ ...form, membershipStatus: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Membership Expires" type="date" value={form.membershipExpires} onChange={(e) => setForm({ ...form, membershipExpires: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update User' : 'Add User')}</Button>
              {editingId && <Button sx={{ ml: 2 }} onClick={resetForm}>Cancel</Button>}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Typography>Loading members...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ background: '#141414' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Membership Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedMember(member)}>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.membershipStatus}</TableCell>
                  <TableCell>
                    {member.role !== 'Admin' && member.membershipStatus === 'Pending Admin Approval' && (
                      <Button size="small" sx={{ mr: 1 }} variant="contained" onClick={(event) => { event.stopPropagation(); handleApproveAdmin(member.id); }}>
                        Approve Admin Request
                      </Button>
                    )}
                    <Button size="small" sx={{ mr: 1 }} variant="outlined" onClick={(event) => { event.stopPropagation(); startEdit(member); }}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={(event) => { event.stopPropagation(); handleDelete(member.id); }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedMember && (
        <Card sx={{ mt: 3, background: '#141414' }}>
          <CardContent>
            <Typography variant="h6">Member Details</Typography>
            <Typography>Name: {selectedMember.fullName}</Typography>
            <Typography>Email: {selectedMember.email}</Typography>
            <Typography>Role: {selectedMember.role}</Typography>
            <Typography>Status: {selectedMember.membershipStatus}</Typography>
            {selectedMember.membershipExpires && (
              <Typography>Expires: {new Date(selectedMember.membershipExpires).toLocaleDateString()}</Typography>
            )}
            {selectedMember.role !== 'Admin' && selectedMember.membershipStatus === 'Pending Admin Approval' && (
              <Button sx={{ mt: 2, mr: 2 }} variant="contained" onClick={() => handleApproveAdmin(selectedMember.id)}>
                Approve Admin Request
              </Button>
            )}
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => startEdit(selectedMember)}>Edit This User</Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
