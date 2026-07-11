import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Grid, Card, CardContent } from '@mui/material';
import memberApi from '../../services/memberService';

const emptyMember = {
  fullName: '',
  email: '',
  role: 'General Public',
  membershipStatus: 'Active'
};

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState(emptyMember);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    memberApi.getAll()
      .then((data) => setMembers(data))
      .catch((error) => console.error('Failed to load members', error))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await memberApi.create(newMember);
      setMembers((prev) => [created, ...prev]);
      setNewMember(emptyMember);
      setSelectedMember(created);
    } catch (error) {
      console.error('Failed to add member', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Members</Typography>
      <Paper sx={{ p: 3, mb: 3, background: '#141414' }}>
        <Typography variant="h6" gutterBottom>Add New Member</Typography>
        <Box component="form" onSubmit={handleCreate}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full name"
                value={newMember.fullName}
                onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Membership Status"
                value={newMember.membershipStatus}
                onChange={(e) => setNewMember({ ...newMember, membershipStatus: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving || !newMember.fullName || !newMember.email}>
                {saving ? 'Saving member...' : 'Add Member'}
              </Button>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedMember(member)}>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.membershipStatus}</TableCell>
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
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
