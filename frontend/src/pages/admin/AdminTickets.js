import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Chip, Avatar, Button, IconButton, 
  Select, MenuItem, TextField, InputAdornment, Dialog, DialogContent,
  DialogTitle, DialogActions, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Pagination
} from '@mui/material';
import {
  Search, FilterList, ViewList, ViewModule, Download, 
  Close, Person, AccessTime, Circle
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, statusFilter, priorityFilter, searchText]);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    if (searchText) {
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.ticketId?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.submittedBy?.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredTickets(filtered);
    setPage(1);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tickets/${id}`, { status });
      fetchTickets();
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err) {
      alert('Error updating ticket');
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Delete this ticket?')) {
      try {
        await API.delete(`/tickets/${id}`);
        fetchTickets();
        setSelectedTicket(null);
      } catch (err) {
        alert('Error deleting ticket');
      }
    }
  };

  // Download single ticket as PDF
  const downloadTicketPDF = (ticket) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('STARBOY HELPDESK', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Ticket Report', 14, 27);
    
    // Line
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 32, 196, 32);
    
    // Ticket Info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Ticket #${ticket.ticketId || ticket._id?.slice(-4)}`, 14, 42);
    
    doc.setFontSize(16);
    doc.text(ticket.title, 14, 52);
    
    // Details Table
    doc.autoTable({
      startY: 60,
      head: [['Field', 'Value']],
      body: [
        ['Status', ticket.status?.toUpperCase()],
        ['Priority', ticket.priority?.toUpperCase()],
        ['Category', ticket.category],
        ['Customer', ticket.submittedBy?.name || 'N/A'],
        ['Email', ticket.submittedBy?.email || 'N/A'],
        ['Agent', ticket.assignedTo?.name || 'Unassigned'],
        ['Created', new Date(ticket.createdAt).toLocaleString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });
    
    // Description
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Description:', 14, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitText = doc.splitTextToSize(ticket.description || '', 180);
    doc.text(splitText, 14, finalY + 7);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 280);
    doc.text('© 2026 Starboy Helpdesk', 150, 280);
    
    doc.save(`ticket-${ticket.ticketId || ticket._id?.slice(-4)}.pdf`);
  };

  // Download all tickets as PDF
  const downloadAllPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('STARBOY HELPDESK', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Support Queue Report', 14, 30);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
    doc.text(`Total Tickets: ${filteredTickets.length}`, 14, 42);
    
    doc.autoTable({
      startY: 50,
      head: [['ID', 'Subject', 'Customer', 'Status', 'Priority', 'Date']],
      body: filteredTickets.map(t => [
        `#${t.ticketId || t._id?.slice(-4)}`,
        t.title?.substring(0, 30) + '...',
        t.submittedBy?.name || 'N/A',
        t.status?.toUpperCase(),
        t.priority?.toUpperCase(),
        new Date(t.createdAt).toLocaleDateString()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`starboy-tickets-${Date.now()}.pdf`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'open': { bg: '#FEF3C7', color: '#B45309', label: '🟡 OPEN' },
      'in-progress': { bg: '#DBEAFE', color: '#1D4ED8', label: '🔵 IN PROGRESS' },
      'pending': { bg: '#FEF3C7', color: '#B45309', label: '🟡 PENDING' },
      'closed': { bg: '#DCFCE7', color: '#16A34A', label: '🟢 CLOSED' }
    };
    return styles[status] || styles.open;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'urgent': { bg: '#FEE2E2', color: '#991B1B', label: 'Urgent' },
      'high': { bg: '#FED7AA', color: '#9A3412', label: 'High' },
      'medium': { bg: '#F3F4F6', color: '#374151', label: 'Normal' },
      'low': { bg: '#E0E7FF', color: '#3730A3', label: 'Low' }
    };
    return styles[priority] || styles.medium;
  };

  const startIdx = (page - 1) * rowsPerPage;
  const paginatedTickets = filteredTickets.slice(startIdx, startIdx + rowsPerPage);
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);

  return (
    <Layout>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
            Support Queue
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
            Manage and resolve customer inquiries
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Circle sx={{ color: '#10B981', fontSize: 10 }} />
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
            8 Agents Active
          </Typography>
        </Box>
      </Box>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search tickets..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment>
            }}
          />
          
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="open">🟡 Unfixed (Open)</MenuItem>
            <MenuItem value="in-progress">🔵 Pending (In Progress)</MenuItem>
            <MenuItem value="closed">🟢 Fixed (Closed)</MenuItem>
          </Select>
          
          <Select
            size="small"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Any Priority</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>

          <Button 
            variant="outlined" 
            startIcon={<FilterList />}
            sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151' }}
          >
            More Filters
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={downloadAllPDF}
            sx={{ 
              bgcolor: '#2563EB', 
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
            }}
          >
            Export PDF
          </Button>

          <Box sx={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => setViewMode('list')}
              sx={{ bgcolor: viewMode === 'list' ? '#F3F4F6' : 'transparent', borderRadius: 0 }}
            >
              <ViewList fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => setViewMode('grid')}
              sx={{ bgcolor: viewMode === 'grid' ? '#F3F4F6' : 'transparent', borderRadius: 0 }}
            >
              <ViewModule fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Tickets Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>TICKET ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>SUBJECT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>PRIORITY</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      No tickets found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket) => {
                  const statusBadge = getStatusBadge(ticket.status);
                  const priorityBadge = getPriorityBadge(ticket.priority);
                  return (
                    <TableRow 
                      key={ticket._id} 
                      hover 
                      sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>
                          #{ticket.ticketId || 'TK-' + ticket._id?.slice(-4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                          {ticket.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {ticket.description?.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#FED7AA', color: '#9A3412', fontSize: '0.8rem' }}>
                            {ticket.submittedBy?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{ticket.submittedBy?.name || 'Unknown'}</Typography>
                            {ticket.attachments?.length > 0 && (
                              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                                {ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusBadge.label}
                          size="small"
                          sx={{ 
                            bgcolor: statusBadge.bg, 
                            color: statusBadge.color, 
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={priorityBadge.label}
                          size="small"
                          sx={{ 
                            bgcolor: priorityBadge.bg, 
                            color: priorityBadge.color, 
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
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
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6' }}>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Showing {startIdx + 1} to {Math.min(startIdx + rowsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
          </Typography>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, v) => setPage(v)}
            size="small"
            color="primary"
          />
        </Box>
      </Paper>

      {/* Ticket Details Dialog */}
      <Dialog 
        open={Boolean(selectedTicket)} 
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                  #{selectedTicket.ticketId || 'TK-' + selectedTicket._id?.slice(-4)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {selectedTicket.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedTicket(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Select
                      size="small"
                      fullWidth
                      value={selectedTicket.status}
                      onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                    >
                      <MenuItem value="open">🟡 Open (Unfixed)</MenuItem>
                      <MenuItem value="in-progress">🔵 In Progress (Pending)</MenuItem>
                      <MenuItem value="closed">🟢 Closed (Fixed)</MenuItem>
                    </Select>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Priority</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={getPriorityBadge(selectedTicket.priority).label}
                      sx={{ 
                        bgcolor: getPriorityBadge(selectedTicket.priority).bg,
                        color: getPriorityBadge(selectedTicket.priority).color,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Customer</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <Avatar sx={{ bgcolor: '#FED7AA', color: '#9A3412' }}>
                    {selectedTicket.submittedBy?.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedTicket.submittedBy?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {selectedTicket.submittedBy?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Category</Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedTicket.category}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Description</Typography>
                <Paper sx={{ p: 2, mt: 1, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.description}
                  </Typography>
                </Paper>
              </Box>

              {/* Display Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>📎 Attachments ({selectedTicket.attachments.length})</Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedTicket.attachments.map((file, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          bgcolor: '#F9FAFB',
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid #E5E7EB'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexGrow: 1 }}>
                          <Box sx={{
                            p: 0.75,
                            bgcolor: file.mimetype.includes('pdf') ? '#FEE2E2' : '#DBEAFE',
                            borderRadius: 1,
                            display: 'flex'
                          }}>
                            <Download sx={{ fontSize: 18, color: file.mimetype.includes('pdf') ? '#DC2626' : '#2563EB' }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={file.originalName}
                            >
                              {file.originalName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {(file.size / 1024).toFixed(2)} KB
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => window.open(`http://localhost:5000/uploads/${file.filename}`, '_blank')}
                          sx={{ textTransform: 'none', ml: 1 }}
                        >
                          Download
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Timeline</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
              <Button 
                onClick={() => downloadTicketPDF(selectedTicket)}
                startIcon={<Download />}
                sx={{ textTransform: 'none' }}
              >
                Download PDF
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button 
                onClick={() => deleteTicket(selectedTicket._id)} 
                color="error"
                sx={{ textTransform: 'none' }}
              >
                Delete
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setSelectedTicket(null)}
                sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
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

export default AdminTickets;