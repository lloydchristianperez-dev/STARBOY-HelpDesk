import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, MenuItem, Grid, Card,
  Chip, Alert, Snackbar, IconButton, Divider, InputAdornment,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Add, Send, Description, PriorityHigh, Category,
  CheckCircle, Info, Close, AccessTime, Delete
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserMyTicket = () => {
  const { user } = useAuth();
  const [myTickets, setMyTickets] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ticket: null });

  const handleDeleteClick = (ticket) => {
    setDeleteDialog({ open: true, ticket });
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.delete(`/tickets/${deleteDialog.ticket._id}`);
      fetchMyTickets();
      setNotification({
        open: true,
        message: '✅ Ticket deleted successfully!',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.msg || 'Error deleting ticket',
        severity: 'error'
      });
    }
    setDeleteDialog({ open: false, ticket: null });
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium'
  });

  useEffect(() => {
    fetchMyTickets();
    const interval = setInterval(fetchMyTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await API.get('/tickets/my-tickets');
      setMyTickets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      await API.post('/tickets', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority
      });

      setFormData({ title: '', description: '', category: 'General', priority: 'medium' });
      fetchMyTickets();
      setNotification({
        open: true,
        message: '🎉 Ticket submitted successfully! Our team will respond soon.',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error submitting ticket. Please try again.',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const getPriorityInfo = (priority) => {
    const info = {
      low: { color: '#10B981', bg: '#DCFCE7', icon: '🟢', label: 'Low Priority' },
      medium: { color: '#F59E0B', bg: '#FEF3C7', icon: '🟡', label: 'Medium Priority' },
      high: { color: '#EF4444', bg: '#FEE2E2', icon: '🔴', label: 'High Priority' },
      urgent: { color: '#7C3AED', bg: '#EDE9FE', icon: '⚠️', label: 'Urgent' }
    };
    return info[priority] || info.medium;
  };

  const getStatusInfo = (status) => {
    const info = {
      open: { color: '#F59E0B', bg: '#FEF3C7', label: 'OPEN' },
      'in-progress': { color: '#2563EB', bg: '#DBEAFE', label: 'IN PROGRESS' },
      pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'PENDING' },
      closed: { color: '#10B981', bg: '#DCFCE7', label: 'RESOLVED' }
    };
    return info[status] || info.open;
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB' }}>
          Submit a New Ticket
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Describe your issue and our support team will get back to you as soon as possible
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex' }}>
                <Add sx={{ color: '#2563EB', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  Create New Ticket
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Fill in the details below to submit your request
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<Info />}>
              <strong>Tip:</strong> Provide as much detail as possible for faster resolution. You can track all your tickets in "Ticket Reports".
            </Alert>

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Ticket Title *
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="e.g., Unable to login to my account"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mt: 1, mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Description sx={{ color: '#9CA3AF' }} /></InputAdornment>
                }}
              />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Category *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Category sx={{ color: '#9CA3AF' }} /></InputAdornment>
                    }}
                  >
                    <MenuItem value="General">General Inquiry</MenuItem>
                    <MenuItem value="Technical">Technical Issue</MenuItem>
                    <MenuItem value="Billing">Billing & Payment</MenuItem>
                    <MenuItem value="Account">Account Issue</MenuItem>
                    <MenuItem value="Feature">Feature Request</MenuItem>
                    <MenuItem value="Bug">Bug Report</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Priority *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PriorityHigh sx={{ color: '#9CA3AF' }} /></InputAdornment>
                    }}
                  >
                    <MenuItem value="low">🟢 Low - Not urgent</MenuItem>
                    <MenuItem value="medium">🟡 Medium - Normal</MenuItem>
                    <MenuItem value="high">🔴 High - Important</MenuItem>
                    <MenuItem value="urgent">⚠️ Urgent - Critical</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Description *
              </Typography>
              <TextField
                fullWidth
                required
                multiline
                rows={8}
                placeholder="Please describe your issue in detail...&#10;&#10;Include:&#10;• What happened?&#10;• When did it start?&#10;• Steps to reproduce&#10;• Error messages (if any)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mt: 1, mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setFormData({ title: '', description: '', category: 'General', priority: 'medium' });
                  }}
                  sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151', px: 3 }}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  disabled={loading}
                  sx={{
                    bgcolor: '#2563EB',
                    textTransform: 'none',
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </Box>

              {loading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
              📊 Your Ticket Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>Total Submitted</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{myTickets.length}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {myTickets.filter(t => t.status === 'open' || t.status === 'pending').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
                  <Typography variant="body2">In Progress</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {myTickets.filter(t => t.status === 'in-progress').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Typography variant="body2">Resolved</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {myTickets.filter(t => t.status === 'closed').length}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 2 }}>
              💡 Tips for Faster Resolution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 18, color: '#2563EB', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '0.85rem' }}>
                  Write a clear, descriptive title
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 18, color: '#2563EB', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '0.85rem' }}>
                  Include steps to reproduce the issue
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 18, color: '#2563EB', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '0.85rem' }}>
                  Choose the right priority level
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 18, color: '#2563EB', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '0.85rem' }}>
                  Check your inbox for follow-ups
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
          🕒 Your Recent Tickets
        </Typography>

        {myTickets.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Description sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>
              No tickets submitted yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
              Use the form above to create your first support ticket
            </Typography>
          </Paper>
        ) : (
          myTickets.slice(0, 5).map((ticket) => {
            const priorityInfo = getPriorityInfo(ticket.priority);
            const statusInfo = getStatusInfo(ticket.status);
            return (
              <Card
                key={ticket._id}
                sx={{
                  mb: 1.5,
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#F9FAFB' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700 }}>
                        #{ticket.ticketId || 'TK-' + ticket._id?.slice(-4)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                        {ticket.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1.5 }}>
                      {ticket.description?.substring(0, 120)}...
                    </Typography>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {ticket.attachments.map((file, idx) => (
                          <Chip
                            key={idx}
                            icon={<Description />}
                            label={file.originalName}
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(`http://localhost:5000/uploads/${file.filename}`, '_blank')}
                            sx={{
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#E5E7EB' }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={priorityInfo.label}
                        size="small"
                        sx={{ bgcolor: priorityInfo.bg, color: priorityInfo.color, fontWeight: 600, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={ticket.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: '#9CA3AF' }} />
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={statusInfo.label}
                      sx={{
                        bgcolor: statusInfo.bg,
                        color: statusInfo.color,
                        fontWeight: 700,
                        minWidth: 100
                      }}
                    />
                    {ticket.status === 'closed' && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(ticket)}
                        sx={{
                          color: '#EF4444',
                          '&:hover': { bgcolor: '#FEE2E2' }
                        }}
                        title="Delete this resolved ticket"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={notification.severity}
          sx={{ borderRadius: 2 }}
          action={
            <IconButton size="small" onClick={() => setNotification({ ...notification, open: false })}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, ticket: null })}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          🗑️ Delete Ticket?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete ticket <strong>"{deleteDialog.ticket?.title}"</strong>?
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, ticket: null })}
            sx={{ textTransform: 'none', color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              bgcolor: '#EF4444',
              textTransform: 'none',
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            Delete Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default UserMyTicket;
