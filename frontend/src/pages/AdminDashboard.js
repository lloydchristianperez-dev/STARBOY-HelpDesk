import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Card, Avatar, Button, IconButton
} from '@mui/material';
import {
  MailOutlineOutlined as MailOutline,
  HourglassEmpty,
  CheckCircleOutlineOutlined as CheckCircleOutline,
  AccessTime,
  ChatBubbleOutlineOutlined as ChatBubbleOutline,
  PersonOutlineOutlined as PersonOutline,
  MoreHoriz,
  Warning
} from '@mui/icons-material';
import Layout from '../components/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: { bg: '#1E3A8A', color: 'white', label: 'URGENT' },
      high: { bg: '#DC2626', color: 'white', label: 'HIGH' },
      medium: { bg: '#E5E7EB', color: '#374151', label: 'STANDARD' },
      low: { bg: '#F3F4F6', color: '#6B7280', label: 'LOW' }
    };
    return styles[priority] || styles.medium;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  const criticalTicket = tickets.find(t => t.priority === 'high' || t.priority === 'urgent');
  const recentTickets = tickets.slice(0, 3);

  return (
    <Layout>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB', mb: 0.5 }}>
          The Clarified Workspace
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Good morning, {user?.name}. You have{' '}
          <Box component="span" sx={{ color: '#2563EB', fontWeight: 600 }}>
            {stats.open} priority tickets
          </Box>
          {' '}requiring attention today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            border: '1px solid #E5E7EB', 
            boxShadow: 'none',
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ 
                p: 1.2, 
                borderRadius: 1.5, 
                bgcolor: '#DBEAFE', 
                display: 'flex' 
              }}>
                <MailOutline sx={{ color: '#2563EB', fontSize: 20 }} />
              </Box>
              <Chip 
                label="+2 from yesterday" 
                size="small" 
                sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem', height: 22 }} 
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Tickets Open
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
              {String(stats.open).padStart(2, '0')}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            border: '1px solid #E5E7EB', 
            boxShadow: 'none' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#F3F4F6', display: 'flex' }}>
                <HourglassEmpty sx={{ color: '#6B7280', fontSize: 20 }} />
              </Box>
              <Chip 
                label="Avg 4h delay" 
                size="small" 
                sx={{ bgcolor: '#F3F4F6', color: '#6B7280', fontSize: '0.7rem', height: 22 }} 
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Pending Tickets
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
              {String(stats.pending).padStart(2, '0')}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            border: '1px solid #E5E7EB', 
            boxShadow: 'none' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#FED7AA', display: 'flex' }}>
                <CheckCircleOutline sx={{ color: '#EA580C', fontSize: 20 }} />
              </Box>
              <Chip 
                label="Goal: 20/day" 
                size="small" 
                sx={{ bgcolor: '#FED7AA', color: '#9A3412', fontSize: '0.7rem', height: 22 }} 
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Solved Today
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
              {String(stats.closed).padStart(2, '0')}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left - My Assigned Tickets */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              My Assigned Tickets
            </Typography>
            <Button sx={{ color: '#2563EB', textTransform: 'none', fontWeight: 600 }}>
              View all
            </Button>
          </Box>

          {tickets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>No tickets assigned yet</Typography>
            </Paper>
          ) : (
            tickets.slice(0, 3).map((ticket) => {
              const badge = getPriorityBadge(ticket.priority);
              return (
                <Card 
                  key={ticket._id}
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2, 
                    border: '1px solid #E5E7EB',
                    boxShadow: 'none',
                    borderLeft: `3px solid ${ticket.priority === 'high' || ticket.priority === 'urgent' ? '#2563EB' : '#E5E7EB'}`,
                    '&:hover': { bgcolor: '#F9FAFB' }
                  }}
                >
                  <Box sx={{ p: 2.5, display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1F2937', width: 40, height: 40, borderRadius: 1.5 }}>
                      {ticket.submittedBy?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                          {ticket.title}
                        </Typography>
                        <Chip 
                          label={badge.label}
                          size="small" 
                          sx={{ 
                            bgcolor: badge.bg, 
                            color: badge.color, 
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 22,
                            borderRadius: 10
                          }} 
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 1.5, fontSize: '0.85rem' }}>
                        {ticket.description?.substring(0, 120)}...
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 14, color: '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {Math.floor((Date.now() - new Date(ticket.createdAt)) / 60000)}m ago
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ChatBubbleOutline sx={{ fontSize: 14, color: '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {ticket.replies || 0} replies
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonOutline sx={{ fontSize: 14, color: '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {ticket.submittedBy?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })
          )}
        </Grid>

        {/* Right - Recent Activity + Critical SLA */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              Recent Activity
            </Typography>
            <IconButton size="small">
              <MoreHoriz />
            </IconButton>
          </Box>

          <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            {recentTickets.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', py: 2 }}>
                No recent activity
              </Typography>
            ) : (
              recentTickets.map((ticket, idx) => {
                const colors = ['#2563EB', '#F59E0B', '#10B981', '#6B7280'];
                return (
                  <Box key={ticket._id} sx={{ display: 'flex', gap: 1.5, mb: idx < recentTickets.length - 1 ? 2.5 : 0 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: colors[idx % colors.length], 
                      mt: 0.5,
                      flexShrink: 0
                    }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.85rem' }}>
                        Ticket #{ticket.ticketId || ticket._id?.slice(-4)} {ticket.status === 'closed' ? 'Resolved' : 'Created'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        By {ticket.submittedBy?.name} · {Math.floor((Date.now() - new Date(ticket.createdAt)) / 60000)}m ago
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Paper>

          {/* Critical SLA Breach */}
          {criticalTicket && (
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              boxShadow: 'none'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#DC2626' }} />
                <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  CRITICAL SLA BREACH
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#7F1D1D', mb: 2, fontSize: '0.85rem' }}>
                Ticket #{criticalTicket.ticketId || criticalTicket._id?.slice(-4)} has been open for 48h without response.
              </Typography>
              <Button 
                fullWidth
                variant="contained"
                sx={{ 
                  bgcolor: '#991B1B',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#7F1D1D', boxShadow: 'none' }
                }}
              >
                Action Now
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center', pt: 3, borderTop: '1px solid #F3F4F6' }}>
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          © 2026 Starboy Helpdesk · Privacy · Terms · Support
        </Typography>
      </Box>
    </Layout>
  );
};

export default AdminDashboard;