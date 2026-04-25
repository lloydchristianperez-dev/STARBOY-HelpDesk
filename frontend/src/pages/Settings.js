import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, Switch,
  Divider, Avatar, IconButton, Alert, Snackbar, Select, MenuItem,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment
} from '@mui/material';
import {
  Notifications, DarkMode, Language, Security, Lock, Visibility,
  VisibilityOff, Email, VolumeUp, Delete, Help, Info, 
  ChevronRight, Warning, Shield, Palette, AccountCircle,
  Logout, Check
} from '@mui/icons-material';
import Layout from '../components/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Settings states
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    ticketUpdates: true,
    weeklyReport: false,
    darkMode: false,
    soundEffects: true,
    language: 'English',
    timezone: 'Asia/Manila',
    twoFactor: false
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
    setNotification({
      open: true,
      message: `✅ ${key} setting updated`,
      severity: 'success'
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      setNotification({ open: true, message: 'Passwords do not match!', severity: 'error' });
      return;
    }
    setNotification({ open: true, message: '✅ Password changed successfully!', severity: 'success' });
    setPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    setNotification({ open: true, message: 'Account deletion request submitted', severity: 'warning' });
    setDeleteDialog(false);
  };

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
              {[
                { icon: <AccountCircle />, label: 'Account', active: true },
                { icon: <Notifications />, label: 'Notifications' },
                { icon: <Security />, label: 'Security' },
                { icon: <Palette />, label: 'Appearance' },
                { icon: <Language />, label: 'Language' },
                { icon: <Help />, label: 'Help & Support' }
              ].map((item, idx) => (
                <ListItem 
                  key={idx}
                  button 
                  sx={{ 
                    borderRadius: 1, 
                    mb: 0.5,
                    bgcolor: item.active ? '#EFF6FF' : 'transparent',
                    color: item.active ? '#2563EB' : '#6B7280',
                    '&:hover': { bgcolor: '#F9FAFB' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: item.active ? 600 : 500, fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
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

          {/* Notification Preferences */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Notifications sx={{ color: '#2563EB' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                Notification Preferences
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Choose what notifications you want to receive
            </Typography>

            <List>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: <Email /> },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: <Notifications /> },
                { key: 'ticketUpdates', label: 'Ticket Status Updates', desc: 'Get notified when tickets change', icon: <Check /> },
                { key: 'weeklyReport', label: 'Weekly Summary Report', desc: 'Receive weekly activity summary', icon: <Info /> },
                { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds for notifications', icon: <VolumeUp /> }
              ].map((item) => (
                <ListItem 
                  key={item.key}
                  sx={{ 
                    borderBottom: '1px solid #F3F4F6',
                    '&:last-child': { borderBottom: 'none' },
                    py: 2
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    secondary={item.desc}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <ListItemSecondaryAction>
                    <Switch 
                      checked={preferences[item.key]}
                      onChange={() => handleToggle(item.key)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' }
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Appearance */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Palette sx={{ color: '#7C3AED' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                Appearance
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Customize the look and feel
            </Typography>

            <List>
              <ListItem sx={{ borderBottom: '1px solid #F3F4F6', py: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>
                  <DarkMode />
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode"
                  secondary="Switch between light and dark theme"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={preferences.darkMode}
                    onChange={() => handleToggle('darkMode')}
                    disabled
                  />
                  <Chip label="Coming Soon" size="small" sx={{ ml: 1, fontSize: '0.65rem' }} />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>
                  <Language />
                </ListItemIcon>
                <ListItemText 
                  primary="Language"
                  secondary="Select your preferred language"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <ListItemSecondaryAction>
                  <Select
                    size="small"
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Filipino">Filipino</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                  </Select>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>

          {/* Security */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Shield sx={{ color: '#10B981' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                Security
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Manage your account security
            </Typography>

            <List>
              <ListItem 
                button 
                onClick={() => setPasswordDialog(true)}
                sx={{ borderBottom: '1px solid #F3F4F6', py: 2, borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>
                  <Lock />
                </ListItemIcon>
                <ListItemText 
                  primary="Change Password"
                  secondary="Update your account password"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <ChevronRight sx={{ color: '#9CA3AF' }} />
              </ListItem>

              <ListItem sx={{ borderBottom: '1px solid #F3F4F6', py: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>
                  <Security />
                </ListItemIcon>
                <ListItemText 
                  primary="Two-Factor Authentication"
                  secondary="Add extra security layer"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={preferences.twoFactor}
                    onChange={() => handleToggle('twoFactor')}
                    disabled
                  />
                  <Chip label="Coming Soon" size="small" sx={{ ml: 1, fontSize: '0.65rem' }} />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>
                  <Info />
                </ListItemIcon>
                <ListItemText 
                  primary="Active Sessions"
                  secondary="Manage your login sessions"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                  View All
                </Button>
              </ListItem>
            </List>
          </Paper>

          {/* Danger Zone */}
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #FECACA', bgcolor: '#FEF2F2', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Warning sx={{ color: '#DC2626' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#991B1B' }}>
                Danger Zone
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#7F1D1D', mb: 3 }}>
              Irreversible actions that affect your account
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #FECACA', boxShadow: 'none' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Logout from all devices</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2 }}>
                    Sign out from all active sessions
                  </Typography>
                  <Button 
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Logout />}
                    onClick={logout}
                    sx={{ textTransform: 'none' }}
                  >
                    Logout Everywhere
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #FECACA', boxShadow: 'none' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Delete Account</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2 }}>
                    Permanently delete your account
                  </Typography>
                  <Button 
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialog(true)}
                    sx={{ textTransform: 'none', boxShadow: 'none' }}
                  >
                    Delete Account
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              STARBOY HelpDesk v1.0.0 · © 2026 All rights reserved
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>🔒 Change Password</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Current Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordData.new}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Password must be at least 8 characters long
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setPasswordDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handlePasswordChange}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', boxShadow: 'none' }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#FEE2E2', borderBottom: '1px solid #FECACA' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#991B1B' }}>
            ⚠️ Delete Account
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Deleting your account will:
          </Typography>
          <Box component="ul" sx={{ color: '#6B7280', pl: 2 }}>
            <li>Permanently delete all your tickets</li>
            <li>Remove all your messages and data</li>
            <li>Cancel any pending follow-ups</li>
            <li>This cannot be reversed</li>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            placeholder='Type "DELETE" to confirm'
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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

export default Settings;