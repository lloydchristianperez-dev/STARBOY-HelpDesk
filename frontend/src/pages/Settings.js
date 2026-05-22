import React from 'react';
import {
  Box, Paper, Typography, Button, Grid, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Chip
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
          ⚙️ Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Manage your account preferences and security settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <List sx={{ p: 0 }}>
              <ListItem
                button
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  '&:hover': { bgcolor: '#F9FAFB' }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText
                  primary="Account"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Account Info */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              👤 Account Information
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Your basic account details
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#FED7AA', color: '#9A3412', fontSize: '2rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>{user?.email}</Typography>
                <Chip
                  label={user?.role === 'admin' ? '🛠️ Staff/Admin' : '👤 Customer'}
                  size="small"
                  sx={{ mt: 1, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600 }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile')}
                sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151' }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              STARBOY HelpDesk v1.0.0 · © 2026 All rights reserved
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Settings;
