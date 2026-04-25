import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, Chip, Avatar, Button, Paper } from '@mui/material';
import {
  MailOutlineOutlined as MailOutline,
  HourglassEmpty,
  CheckCircleOutlineOutlined as CheckCircleOutline,
  AccessTime,
  PersonOutlineOutlined as PersonOutline
} from '@mui/icons-material';
import Layout from '../components/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets/my-tickets');
      setTickets(res.data);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB', mb: 0.5 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Track and manage your support tickets efficiently.
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#DBEAFE', display: 'inline-flex', mb: 2 }}>
              <MailOutline sx={{ color: '#2563EB', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Total Tickets
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>{stats.total}</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#FEF3C7', display: 'inline-flex', mb: 2 }}>
              <MailOutline sx={{ color: '#F59E0B', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Open
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>{stats.open}</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#F3F4F6', display: 'inline-flex', mb: 2 }}>
              <HourglassEmpty sx={{ color: '#6B7280', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Pending
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>{stats.pending}</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#DCFCE7', display: 'inline-flex', mb: 2 }}>
              <CheckCircleOutline sx={{ color: '#10B981', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Resolved
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>{stats.closed}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
        Recent Tickets
      </Typography>

      {tickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            No tickets yet. Click "My Ticket" in the sidebar to create one.
          </Typography>
        </Paper>
      ) : (
        tickets.slice(0, 5).map((ticket) => (
          <Card key={ticket._id} sx={{ mb: 1.5, p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{ticket.title}</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {new Date(ticket.createdAt).toLocaleDateString()} · #{ticket.ticketId || ticket._id?.slice(-4)}
                </Typography>
              </Box>
              <Chip 
                label={ticket.status.toUpperCase()} 
                size="small"
                sx={{ 
                  bgcolor: ticket.status === 'closed' ? '#DCFCE7' : ticket.status === 'open' ? '#FEF3C7' : '#DBEAFE',
                  color: ticket.status === 'closed' ? '#16A34A' : ticket.status === 'open' ? '#CA8A04' : '#2563EB',
                  fontWeight: 600
                }}
              />
            </Box>
          </Card>
        ))
      )}
    </Layout>
  );
};

export default Dashboard;