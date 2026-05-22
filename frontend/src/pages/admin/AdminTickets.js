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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    doc.text(ticket.title, 14, 52);

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
      {/* ... continue displaying tickets */}
    </Layout>
  );
};

export default AdminTickets;