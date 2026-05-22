import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Avatar, Grid, Card,
  Chip, Divider, IconButton, Alert, Snackbar, InputAdornment
} from '@mui/material';
import {
  Edit, Save, Cancel, Email, Person, CalendarToday,
  ConfirmationNumber, CheckCircle, Cake, Badge as BadgeIcon,
  CameraAlt, Phone, LocationOn
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets/my-tickets');
      setTickets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    try {
      await API.put('/auth/profile', formData);
      setEditMode(false);
      setNotification({
        open: true,
        message: '✅ Profile updated successfully!',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setEditMode(false);
  };

  const stats = {
    total: tickets.length,
    resolved: tickets.filter(t => t.status === 'closed').length,
    pending: tickets.filter(t => t.status !== 'closed').length
  };

  const resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(0) : 0;

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
          My Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#FED7AA',
                  color: '#9A3412',
                  fontSize: '3rem',
                  fontWeight: 700,
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#2563EB',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: '#1D4ED8' }
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {user?.email}
            </Typography>

            <Chip
              label="👤 Customer Account"
              sx={{
                mt: 2,
                bgcolor: '#DBEAFE',
                color: '#2563EB',
                fontWeight: 600
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Account Info
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarToday sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>Member Since</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BadgeIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>Account ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {user?.id?.slice(-8).toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>Status</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                      Active
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                Personal Information
              </Typography>
              {!editMode ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{
                      bgcolor: '#2563EB',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editMode}
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Person sx={{ color: '#9CA3AF' }} /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editMode}
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email sx={{ color: '#9CA3AF' }} /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Phone (Coming Soon)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="+63 XXX XXX XXXX"
                  disabled
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#9CA3AF' }} /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Location (Coming Soon)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="City, Country"
                  disabled
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#9CA3AF' }} /></InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              📊 Your Activity
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: '#EFF6FF', boxShadow: 'none' }}>
                  <ConfirmationNumber sx={{ color: '#2563EB', fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Total Tickets</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: '#DCFCE7', boxShadow: 'none' }}>
                  <CheckCircle sx={{ color: '#10B981', fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                    {stats.resolved}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Resolved</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: '#FEF3C7', boxShadow: 'none' }}>
                  <Cake sx={{ color: '#F59E0B', fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                    {resolutionRate}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Resolution Rate</Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} sx={{ borderRadius: 2 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default UserProfile;
