import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Chip, Avatar, Button, IconButton,
  Select, MenuItem, TextField, InputAdornment, Dialog, DialogContent,
  DialogTitle, DialogActions, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Pagination
} from '@mui/material';
import {
  Search, FilterList, ViewList, ViewModule,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, statusFilter, priorityFilter, searchText]);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data || []);
    } catch (err) {
      console.log('Error:', err);
      setTickets([]);
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

  const downloadTicketPDF = (ticket) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('STARBOY HELPDESK', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Ticket Report', 14, 27);

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Ticket #${ticket.ticketId || ticket._id?.slice(-4)}`, 14, 42);

    doc.setFontSize(16);
    doc.text(ticket.title || 'Untitled Ticket', 14, 52);

    doc.autoTable({
      startY: 60,
      head: [['Field', 'Value']],
      body: [
        ['Status', (ticket.status || '').toUpperCase()],
        ['Priority', (ticket.priority || '').toUpperCase()],
        ['Category', ticket.category || 'N/A'],
        ['Customer', ticket.submittedBy?.name || 'N/A'],
        ['Email', ticket.submittedBy?.email || 'N/A'],
        ['Agent', ticket.assignedTo?.name || 'Unassigned'],
        ['Created', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Description:', 14, finalY);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitText = doc.splitTextToSize(ticket.description || '', 180);
    doc.text(splitText, 14, finalY + 7);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 280);
    doc.text('© 2026 Starboy Helpdesk', 150, 280);

    doc.save(`ticket-${ticket.ticketId || ticket._id?.slice(-4)}.pdf`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: '#FEF3C7', color: '#B45309', label: '🟡 OPEN' },
      'in-progress': { bg: '#DBEAFE', color: '#1D4ED8', label: '🔵 IN PROGRESS' },
      pending: { bg: '#FEF3C7', color: '#B45309', label: '🟡 PENDING' },
      closed: { bg: '#DCFCE7', color: '#16A34A', label: '🟢 CLOSED' }
    };
    return styles[status] || styles.open;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: { bg: '#FEE2E2', color: '#991B1B', label: 'Urgent' },
      high: { bg: '#FED7AA', color: '#9A3412', label: 'High' },
      medium: { bg: '#F3F4F6', color: '#374151', label: 'Normal' },
      low: { bg: '#E0E7FF', color: '#3730A3', label: 'Low' }
    };
    return styles[priority] || styles.medium;
  };

  const startIdx = (page - 1) * rowsPerPage;
  const paginatedTickets = filteredTickets.slice(startIdx, startIdx + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));

  return (
    <Layout>
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

      {viewMode === 'list' ? (
        <Paper sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTickets.length > 0 ? paginatedTickets.map((ticket) => {
                  const statusStyle = getStatusBadge(ticket.status);
                  const priorityStyle = getPriorityBadge(ticket.priority);
                  return (
                    <TableRow key={ticket._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {ticket.title || 'Untitled'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          #{ticket.ticketId || ticket._id?.slice(-4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{ticket.submittedBy?.name || 'N/A'}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {ticket.submittedBy?.email || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusStyle.label}
                          size="small"
                          sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={priorityStyle.label}
                          size="small"
                          sx={{ bgcolor: priorityStyle.bg, color: priorityStyle.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedTicket(ticket)}
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: '#6B7280' }}>No tickets found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {paginatedTickets.length > 0 ? paginatedTickets.map((ticket) => {
            const statusStyle = getStatusBadge(ticket.status);
            const priorityStyle = getPriorityBadge(ticket.priority);
            return (
              <Grid item xs={12} md={6} lg={4} key={ticket._id}>
                <Paper sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {ticket.title || 'Untitled'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
                    #{ticket.ticketId || ticket._id?.slice(-4)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={statusStyle.label} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} />
                    <Chip label={priorityStyle.label} size="small" sx={{ bgcolor: priorityStyle.bg, color: priorityStyle.color, fontWeight: 600 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
                    {ticket.submittedBy?.name || 'N/A'} • {ticket.submittedBy?.email || 'N/A'}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => setSelectedTicket(ticket)} sx={{ textTransform: 'none' }}>
                    View
                  </Button>
                </Paper>
              </Grid>
            );
          }) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: 2, boxShadow: 'none' }}>
                <Typography sx={{ color: '#6B7280' }}>No tickets found.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          page={page}
          count={totalPages}
          onChange={(_, value) => setPage(value)}
          shape="rounded"
          color="primary"
        />
      </Box>

      <Dialog open={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedTicket?.title || 'Ticket Details'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              #{selectedTicket?.ticketId || selectedTicket?._id?.slice(-4)}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedTicket(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusBadge(selectedTicket.status).label}
                  sx={{
                    bgcolor: getStatusBadge(selectedTicket.status).bg,
                    color: getStatusBadge(selectedTicket.status).color,
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={getPriorityBadge(selectedTicket.priority).label}
                  sx={{
                    bgcolor: getPriorityBadge(selectedTicket.priority).bg,
                    color: getPriorityBadge(selectedTicket.priority).color,
                    fontWeight: 600
                  }}
                />
              </Box>

              <Typography variant="body2">
                <strong>Category:</strong> {selectedTicket.category || 'N/A'}
              </Typography>

              <Typography variant="body2">
                <strong>Description:</strong> {selectedTicket.description || 'N/A'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                <Typography variant="body2">
                  {selectedTicket.submittedBy?.name || 'N/A'} ({selectedTicket.submittedBy?.email || 'N/A'})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" />
                <Typography variant="body2">
                  {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="error"
              variant="outlined"
              onClick={() => selectedTicket && deleteTicket(selectedTicket._id)}
            >
              Delete
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => selectedTicket && updateStatus(selectedTicket._id, 'pending')}
            >
              Mark Pending
            </Button>
            <Button
              variant="contained"
              onClick={() => selectedTicket && updateStatus(selectedTicket._id, 'closed')}
            >
              Mark Closed
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminTickets;
