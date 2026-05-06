import React, { useState } from 'react';
import { 
  Box, TextField, IconButton, Avatar, Typography, Badge, 
  InputAdornment, Menu, MenuItem, Divider 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      {/* Search Bar */}
      <Box sx={{ flexGrow: 1, maxWidth: 480 }}>
        <TextField
          placeholder="Search for tickets, users, or help docs..."
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#F9FAFB',
              borderRadius: 2,
              fontSize: '0.9rem',
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#D1D5DB' }
            }
          }}
        />
      </Box>

      {/* Right Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton sx={{ color: '#6B7280' }}>
          <Badge badgeContent={3} color="error" variant="dot">
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>

        <IconButton sx={{ color: '#6B7280' }}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>

        {/* User Profile */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            cursor: 'pointer',
            pl: 2,
            py: 0.5
          }}
          onClick={handleProfileClick}
        >
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.85rem' }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
              {user?.role === 'admin' ? 'Senior Agent' : 'Customer'}
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36,
              bgcolor: '#FED7AA',
              color: '#9A3412',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
        >
          <MenuItem disabled>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Settings</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;