import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/GridView';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MailIcon from '@mui/icons-material/MailOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onNewTicket }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Admin menu
  const adminMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Tickets', icon: <ConfirmationNumberIcon />, path: '/admin/tickets' },
    { text: 'Follow-ups', icon: <MailIcon />, path: '/admin/followups' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/admin/customers' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/admin/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  // User menu (5 buttons as requested)
  const userMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Ticket', icon: <ConfirmationNumberIcon />, path: '/dashboard/my-ticket' },
    { text: 'Ticket Reports', icon: <AssignmentIcon />, path: '/dashboard/reports' },
    { text: 'Inbox', icon: <MailIcon />, path: '/dashboard/inbox' },
    { text: 'My Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' }
  ];

  const menu = user?.role === 'admin' ? adminMenu : userMenu;

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #F3F4F6', textAlign: 'left' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <img
            src="/starboy-logo.png"
            alt="STARBOY Logo"
            style={{ width: 34, height: 34, objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '0.4px',
              background: 'linear-gradient(135deg,#4F46E5,#A855F7,#EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            STARBOY
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={index}
              button
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                py: 1,
                px: 1.5,
                color: isActive ? '#2563EB' : '#6B7280',
                bgcolor: isActive ? '#EFF6FF' : 'transparent',
                '&:hover': {
                  bgcolor: '#F9FAFB',
                  color: '#2563EB'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 600 : 500, 
                  fontSize: '0.9rem' 
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* New Ticket Button - only for users */}
      {user?.role === 'user' && onNewTicket && (
        <Box sx={{ px: 2.5, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onNewTicket}
            sx={{
              bgcolor: '#2563EB',
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            New Ticket
          </Button>
        </Box>
      )}


      {/* Logout */}
      <Box 
        sx={{ 
          borderTop: '1px solid #F3F4F6',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box
          onClick={handleLogout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            color: '#6B7280',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' }
          }}
        >
          <LogoutIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Logout</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;