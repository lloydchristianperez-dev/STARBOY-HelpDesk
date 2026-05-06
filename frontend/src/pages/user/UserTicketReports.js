import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, InputAdornment, Grid, Card,
  Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Tabs, Tab, Badge, Divider
} from '@mui/material';
import {
  Search, CheckCircle, Cancel, HourglassEmpty, Download, Visibility,
  AccessTime, Category, Close, Description, Person, ArrowForward,
  FilterList
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserTicketReports = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentTab, setCurrentTab] = useState('all');

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchText, currentTab]);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets/my-tickets');
      setTickets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (currentTab === 'fixed') {
      filtered = filtered.filter(t => t.status === 'closed');
    } else if (currentTab === 'unfixed') {
      filtered = filtered.filter(t => t.status === 'open');
    } else if (currentTab === 'pending') {
      filtered = filtered.filter(t => t.status === 'in-progress' || t.status === 'pending');
    }

    if (searchText) {
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.ticketId?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  const downloadTicketPDF = (ticket) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('STARBOY HELPDESK', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Your Ticket Report', 14, 27);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 32, 196, 32);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Ticket #${ticket.ticketId || ticket._id?.slice(-4)}`, 14, 42);
    
    doc.setFontSize(16);
    doc.text(ticket.title, 14, 52);
    
    doc.autoTable({
      startY: 60,
      head: [['Field', 'Value']],
      body: [
        ['Status', ticket.status?.toUpperCase()],
        ['Priority', ticket.priority?.toUpperCase()],
        ['Category', ticket.category],
        ['Agent Assigned', ticket.assignedTo?.name || 'Unassigned'],
        ['Created', new Date(ticket.createdAt).toLocaleString()],
        ['Last Updated', new Date(ticket.updatedAt).toLocaleString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Description:', 14, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitText = doc.splitTextToSize(ticket.description || '', 180);
    doc.text(splitText, 14, finalY + 7);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 280);
    doc.text('© 2026 Starboy Helpdesk', 150, 280);
    
    doc.save(`my-ticket-${ticket.ticketId || ticket._id?.slice(-4)}.pdf`);
  };

  const getStatusInfo = (status) => {
    const info = {
      open: { 
        color: '#F59E0B', 
        bg: '#FEF3C7', 
        label: '❌ UNFIXED',
        icon: <Cancel />,
        text: 'Your ticket is still open and waiting for agent review'
      },
      'in-progress': { 
        color: '#2563EB', 
        bg: '#DBEAFE', 
        label: '⏳ PENDING',
        icon: <HourglassEmpty />,
        text: 'An agent is currently working on your ticket'
      },
      pending: { 
        color: '#2563EB', 
        bg: '#DBEAFE', 
        label: '⏳ PENDING',
        icon: <HourglassEmpty />,
        text: 'Your ticket is being processed'
      },
      closed: { 
        color: '#10B981', 
        bg: '#DCFCE7', 
        label: '✅ FIXED',
        icon: <CheckCircle />,
        text: 'Your ticket has been resolved successfully'
      }
    };
    return info[status] || info.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#7C3AED'
    };
    return colors[priority] || colors.medium;
  };

  const stats = {
    total: tickets.length,
    fixed: tickets.filter(t => t.status === 'closed').length,
    pending: tickets.filter(t => t.status === 'in-progress' || t.status === 'pending').length,
    unfixed: tickets.filter(t => t.status === 'open').length
  };

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
            My Ticket Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
            Track all your submitted tickets and their current status
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card 
            onClick={() => setCurrentTab('all')}
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              border: currentTab === 'all' ? '2px solid #2563EB' : '1px solid #E5E7EB', 
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#DBEAFE', display: 'inline-flex', mb: 2 }}>
              <Description sx={{ color: '#2563EB', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              Total Tickets
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>{stats.total}</Typography>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card 
            onClick={() => setCurrentTab('fixed')}
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              border: currentTab === 'fixed' ? '2px solid #10B981' : '1px solid #E5E7EB', 
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#DCFCE7', display: 'inline-flex', mb: 2 }}>
              <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              ✅ Fixed
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: '#10B981' }}>{stats.fixed}</Typography>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card 
            onClick={() => setCurrentTab('pending')}
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              border: currentTab === 'pending' ? '2px solid #2563EB' : '1px solid #E5E7EB', 
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#DBEAFE', display: 'inline-flex', mb: 2 }}>
              <HourglassEmpty sx={{ color: '#2563EB', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              ⏳ Pending
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: '#2563EB' }}>{stats.pending}</Typography>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card 
            onClick={() => setCurrentTab('unfixed')}
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              border: currentTab === 'unfixed' ? '2px solid #F59E0B' : '1px solid #E5E7EB', 
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#FEF3C7', display: 'inline-flex', mb: 2 }}>
              <Cancel sx={{ color: '#F59E0B', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              ❌ Unfixed
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: '#F59E0B' }}>{stats.unfixed}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          sx={{ 
            px: 2,
            '& .MuiTabs-indicator': { bgcolor: '#2563EB' },
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 }
          }}
        >
          <Tab 
            value="all" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                All Tickets <Badge badgeContent={stats.total} color="primary" />
              </Box>
            } 
          />
          <Tab 
            value="fixed" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ✅ Fixed <Badge badgeContent={stats.fixed} color="success" />
              </Box>
            } 
          />
          <Tab 
            value="pending" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⏳ Pending <Badge badgeContent={stats.pending} color="info" />
              </Box>
            } 
          />
          <Tab 
            value="unfixed" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ❌ Unfixed <Badge badgeContent={stats.unfixed} color="warning" />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <TextField
          placeholder="Search by ticket ID or title..."
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment>
          }}
        />
      </Paper>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
          <Description sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
            No tickets found
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            {currentTab === 'all' ? 'You haven\'t submitted any tickets yet' : `No ${currentTab} tickets`}
          </Typography>
        </Paper>
      ) : (
        filteredTickets.map((ticket) => {
          const statusInfo = getStatusInfo(ticket.status);
          return (
            <Card 
              key={ticket._id}
              sx={{ 
                mb: 1.5, 
                borderRadius: 2, 
                border: '1px solid #E5E7EB', 
                boxShadow: 'none',
                borderLeft: `4px solid ${statusInfo.color}`,
                '&:hover': { bgcolor: '#F9FAFB' }
              }}
            >
              <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: getPriorityColor(ticket.priority) 
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700 }}>
                      #{ticket.ticketId || 'TK-' + ticket._id?.slice(-4)}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                      {ticket.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1.5, fontSize: '0.85rem' }}>
                    {ticket.description?.substring(0, 150)}...
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={ticket.category} 
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip 
                      label={ticket.priority?.toUpperCase()} 
                      size="small"
                      sx={{ 
                        bgcolor: `${getPriorityColor(ticket.priority)}20`,
                        color: getPriorityColor(ticket.priority),
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 14, color: '#9CA3AF' }} />
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {ticket.assignedTo && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person sx={{ fontSize: 14, color: '#9CA3AF' }} />
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          Agent: {ticket.assignedTo.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  <Chip 
                    label={statusInfo.label}
                    sx={{ 
                      bgcolor: statusInfo.bg, 
                      color: statusInfo.color, 
                      fontWeight: 700,
                      minWidth: 130
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedTicket(ticket)}
                      sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151' }}
                    >
                      View
                    </Button>
                    <IconButton 
                      size="small" 
                      onClick={() => downloadTicketPDF(ticket)}
                      sx={{ color: '#2563EB' }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Card>
          );
        })
      )}

      {/* Ticket Details Dialog */}
      <Dialog 
        open={Boolean(selectedTicket)} 
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700 }}>
                    #{selectedTicket.ticketId || 'TK-' + selectedTicket._id?.slice(-4)}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedTicket.title}
                  </Typography>
                </Box>
                <IconButton onClick={() => setSelectedTicket(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              {/* Status Alert */}
              <Paper sx={{ 
                p: 2.5, 
                mb: 3, 
                borderRadius: 2, 
                bgcolor: getStatusInfo(selectedTicket.status).bg,
                border: `1px solid ${getStatusInfo(selectedTicket.status).color}40`,
                boxShadow: 'none'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: getStatusInfo(selectedTicket.status).color }}>
                    {getStatusInfo(selectedTicket.status).icon}
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: getStatusInfo(selectedTicket.status).color }}>
                      {getStatusInfo(selectedTicket.status).label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {getStatusInfo(selectedTicket.status).text}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    Priority
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: getPriorityColor(selectedTicket.priority) }}>
                    {selectedTicket.priority?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedTicket.category}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Description
                </Typography>
                <Paper sx={{ p: 2, mt: 1, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.description}
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Timeline */}
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                📅 Timeline
              </Typography>
              <Box sx={{ position: 'relative', pl: 3 }}>
                <Box sx={{ 
                  position: 'absolute',
                  left: 8,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: '#E5E7EB'
                }} />
                <Box sx={{ mb: 2, position: 'relative' }}>
                  <Box sx={{ 
                    position: 'absolute',
                    left: -20,
                    top: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#2563EB',
                    border: '2px solid white',
                    boxShadow: '0 0 0 2px #2563EB'
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Ticket Created</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {selectedTicket.status !== 'open' && (
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ 
                      position: 'absolute',
                      left: -20,
                      top: 0,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusInfo(selectedTicket.status).color,
                      border: '2px solid white'
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Status Updated: {selectedTicket.status?.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {new Date(selectedTicket.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
              <Button 
                startIcon={<Download />}
                onClick={() => downloadTicketPDF(selectedTicket)}
                sx={{ textTransform: 'none' }}
              >
                Download PDF
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button 
                variant="contained"
                onClick={() => setSelectedTicket(null)}
                sx={{ bgcolor: '#2563EB', textTransform: 'none', boxShadow: 'none' }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
};

export default UserTicketReports;