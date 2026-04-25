// frontend/src/components/Layout.js
import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children, onNewTicket }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar onNewTicket={onNewTicket} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '240px',
          p: 4,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;