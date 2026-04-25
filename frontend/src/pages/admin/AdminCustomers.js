import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Avatar, Chip, Grid, 
  InputAdornment, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Pagination, Card, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Divider
} from '@mui/material';
import {
  Search, Person, Email, Phone, CalendarToday, 
  ConfirmationNumber, Close, Visibility
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, ticketRes] = await Promise.all([
        API.get('/auth/customers'),
        API.get('/tickets')
      ]);
      setCustomers(custRes.data);
      setTickets(ticketRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getCustomerTickets = (customerId) => {
    return tickets.filter(t => t.submittedBy?._id === customerId);
  };

  const getCustomerStats = (customerId) => {
    const customerTickets = getCustomerTickets(customerId);
    return {
      total: customerTickets.length,
      open: customerTickets.filter(t => t.status === 'open').length,
      resolved: customerTickets.filter(t => t.status === 'closed').length
    };
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const startIdx = (page - 1) * rowsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIdx, startIdx + rowsPerPage);
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
          Customers
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Manage and view all customer accounts
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DBEAFE' }}>
                <Person sx={{ color: '#2563EB' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Total Customers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{customers.length}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DCFCE7' }}>
                <ConfirmationNumber sx={{ color: '#10B981' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Total Tickets
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{tickets.length}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF3C7' }}>
                <Email sx={{ color: '#F59E0B' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Active This Week
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {customers.filter(c => {
                    const diff = Date.now() - new Date(c.createdAt);
                    return diff < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <TextField
          placeholder="Search by name or email..."
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment>
          }}
        />
      </Paper>

      {/* Customers Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>TOTAL TICKETS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>OPEN</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>JOINED</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', letterSpacing: 0.5 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => {
                  const stats = getCustomerStats(customer._id);
                  return (
                    <TableRow key={customer._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#FED7AA', color: '#9A3412', width: 36, height: 36 }}>
                            {customer.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {customer.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {customer.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={stats.total} 
                          size="small"
                          sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        {stats.open > 0 ? (
                          <Chip 
                            label={stats.open} 
                            size="small"
                            sx={{ bgcolor: '#FEF3C7', color: '#CA8A04', fontWeight: 700 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedCustomer(customer)}
                          sx={{ color: '#2563EB' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6' }}>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Showing {startIdx + 1} to {Math.min(startIdx + rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* Customer Details Dialog */}
      <Dialog 
        open={Boolean(selectedCustomer)} 
        onClose={() => setSelectedCustomer(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedCustomer && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#FED7AA', color: '#9A3412', width: 50, height: 50 }}>
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedCustomer.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    Customer ID: {selectedCustomer._id?.slice(-8)}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedCustomer(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: '#6B7280', fontSize: 20 }} />
                    <Typography variant="body2">{selectedCustomer.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ color: '#6B7280', fontSize: 20 }} />
                    <Typography variant="body2">
                      Joined: {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Customer's Tickets
              </Typography>

              {getCustomerTickets(selectedCustomer._id).length === 0 ? (
                <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', py: 4 }}>
                  This customer has no tickets yet
                </Typography>
              ) : (
                getCustomerTickets(selectedCustomer._id).map((ticket) => (
                  <Paper 
                    key={ticket._id}
                    sx={{ p: 2, mb: 1, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ticket.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          #{ticket.ticketId} · {new Date(ticket.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={ticket.status.toUpperCase()} 
                        size="small"
                        sx={{ 
                          bgcolor: ticket.status === 'closed' ? '#DCFCE7' : '#FEF3C7',
                          color: ticket.status === 'closed' ? '#16A34A' : '#CA8A04',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Paper>
                ))
              )}
            </DialogContent>
            
            <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
              <Button onClick={() => setSelectedCustomer(null)} sx={{ textTransform: 'none' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
};

export default AdminCustomers;