import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Avatar, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert,
  Grid, InputAdornment, Divider
} from '@mui/material';
import {
  Send, AttachFile, Search, MailOutline, AccessTime, Person,
  CheckCircle, Close, Add, Email
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';

const AdminFollowups = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
    ticketId: '',
    type: 'follow-up'
  });

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
    fetchSentMessages();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/auth/customers');
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSentMessages = async () => {
    try {
      const res = await API.get('/messages/sent');
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSend = async () => {
    try {
      await API.post('/messages', formData);
      alert('✅ Follow-up sent successfully!');
      setOpen(false);
      setFormData({ to: '', subject: '', content: '', ticketId: '', type: 'follow-up' });
      fetchSentMessages();
    } catch (err) {
      alert('Error sending message');
    }
  };

  const applyTemplate = (template) => {
    const templates = {
      proof: {
        subject: 'Additional Documents Required',
        content: 'Hello,\n\nThank you for contacting STARBOY Helpdesk. To proceed with your ticket, we need additional documentation:\n\n1. Screenshot of the issue\n2. Transaction receipt (if applicable)\n3. Account verification details\n\nPlease reply to this email with the requested documents at your earliest convenience.\n\nBest regards,\nSTARBOY Support Team'
      },
      update: {
        subject: 'Update on Your Ticket',
        content: 'Hello,\n\nWe wanted to update you on the status of your ticket. Our team is currently investigating the issue and we will provide a resolution shortly.\n\nWe appreciate your patience.\n\nBest regards,\nSTARBOY Support Team'
      },
      resolved: {
        subject: 'Your Ticket Has Been Resolved',
        content: 'Hello,\n\nWe are pleased to inform you that your ticket has been successfully resolved.\n\nIf you have any further questions, please don\'t hesitate to contact us.\n\nBest regards,\nSTARBOY Support Team'
      }
    };
    setFormData({ ...formData, ...templates[template] });
  };

  const filteredMessages = messages.filter(msg => 
    msg.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
    msg.to?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
            Follow-ups
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
            Email customers for additional information or updates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ 
            bgcolor: '#2563EB', 
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
          }}
        >
          New Follow-up
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DBEAFE' }}>
                <Email sx={{ color: '#2563EB' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Total Sent
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{messages.length}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF3C7' }}>
                <AccessTime sx={{ color: '#F59E0B' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Pending Response
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {messages.filter(m => !m.isRead).length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DCFCE7' }}>
                <CheckCircle sx={{ color: '#10B981' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Read
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {messages.filter(m => m.isRead).length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <TextField
          placeholder="Search follow-ups..."
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment>
          }}
        />
      </Paper>

      {/* Messages List */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        {filteredMessages.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <MailOutline sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>No follow-ups sent yet</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
              Click "New Follow-up" to send your first email
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', boxShadow: 'none' }}
            >
              Send First Follow-up
            </Button>
          </Box>
        ) : (
          filteredMessages.map((msg, idx) => (
            <Box 
              key={msg._id}
              sx={{ 
                p: 2.5, 
                borderBottom: idx < filteredMessages.length - 1 ? '1px solid #F3F4F6' : 'none',
                '&:hover': { bgcolor: '#F9FAFB' },
                cursor: 'pointer'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#FED7AA', color: '#9A3412' }}>
                  {msg.to?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                      To: {msg.to?.name} ({msg.to?.email})
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={msg.isRead ? 'Read' : 'Unread'} 
                        size="small"
                        sx={{ 
                          bgcolor: msg.isRead ? '#DCFCE7' : '#FEF3C7',
                          color: msg.isRead ? '#16A34A' : '#CA8A04',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB', mb: 0.5 }}>
                    {msg.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                    {msg.content?.substring(0, 150)}...
                  </Typography>
                  {msg.ticketId && (
                    <Chip 
                      label={`Related: #${msg.ticketId?.ticketId || msg.ticketId?._id?.slice(-4)}`}
                      size="small"
                      sx={{ mt: 1, bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* New Follow-up Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2563EB', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>📧 Send Follow-up Email</Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Use templates below for quick messages!
          </Alert>

          {/* Templates */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
              Quick Templates
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="📄 Request Proof" 
                onClick={() => applyTemplate('proof')} 
                sx={{ cursor: 'pointer' }}
                clickable
              />
              <Chip 
                label="🔔 Status Update" 
                onClick={() => applyTemplate('update')} 
                sx={{ cursor: 'pointer' }}
                clickable
              />
              <Chip 
                label="✅ Mark as Resolved" 
                onClick={() => applyTemplate('resolved')} 
                sx={{ cursor: 'pointer' }}
                clickable
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <TextField
            select
            label="To (Customer)"
            fullWidth
            margin="normal"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          >
            {customers.map((customer) => (
              <MenuItem key={customer._id} value={customer._id}>
                {customer.name} ({customer.email})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Related Ticket (Optional)"
            fullWidth
            margin="normal"
            value={formData.ticketId}
            onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
          >
            <MenuItem value="">None</MenuItem>
            {tickets.map((ticket) => (
              <MenuItem key={ticket._id} value={ticket._id}>
                #{ticket.ticketId} - {ticket.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Subject"
            fullWidth
            margin="normal"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />

          <TextField
            label="Message"
            fullWidth
            multiline
            rows={8}
            margin="normal"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your email message here..."
          />

          <Box sx={{ mt: 1 }}>
            <Button startIcon={<AttachFile />} size="small" sx={{ textTransform: 'none' }}>
              Attach File (Coming Soon)
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSend}
            disabled={!formData.to || !formData.subject || !formData.content}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', boxShadow: 'none' }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminFollowups;