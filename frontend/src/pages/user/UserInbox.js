import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, InputAdornment, Grid,
  Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Badge, Divider, List, ListItem, Tabs, Tab
} from '@mui/material';
import {
  Search, Inbox, MarkEmailRead, MarkEmailUnread, Reply, Delete,
  AttachFile, Close, Email, Person, AccessTime, StarBorder, Star
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import API from '../../services/api';

const UserInbox = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await API.get('/messages/inbox');
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      markAsRead(msg._id);
    }
  };

  const filteredMessages = messages.filter(msg => {
    let matchSearch = !searchText || 
      msg.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.from?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    if (currentTab === 'unread') return matchSearch && !msg.isRead;
    if (currentTab === 'read') return matchSearch && msg.isRead;
    return matchSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
          📥 Inbox
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Messages from STARBOY support team
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DBEAFE' }}>
                <Inbox sx={{ color: '#2563EB' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Total Messages
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
                <MarkEmailUnread sx={{ color: '#F59E0B' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Unread
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#F59E0B' }}>{unreadCount}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DCFCE7' }}>
                <MarkEmailRead sx={{ color: '#10B981' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  Read
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{messages.length - unreadCount}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs & Search */}
      <Paper sx={{ mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <TextField
            placeholder="Search messages..."
            size="small"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment>
            }}
          />
        </Box>
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
                All <Badge badgeContent={messages.length} color="primary" />
              </Box>
            } 
          />
          <Tab 
            value="unread" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Unread <Badge badgeContent={unreadCount} color="warning" />
              </Box>
            } 
          />
          <Tab 
            value="read" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Read
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Messages List */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        {filteredMessages.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Inbox sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              {messages.length === 0 ? 'No messages yet' : 'No messages match your search'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              {messages.length === 0 ? 'Messages from STARBOY staff will appear here' : 'Try a different search'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredMessages.map((msg, idx) => (
              <ListItem
                key={msg._id}
                button
                onClick={() => handleOpenMessage(msg)}
                sx={{ 
                  p: 2.5,
                  borderBottom: idx < filteredMessages.length - 1 ? '1px solid #F3F4F6' : 'none',
                  bgcolor: !msg.isRead ? '#EFF6FF' : 'transparent',
                  '&:hover': { bgcolor: '#F9FAFB' },
                  gap: 2
                }}
              >
                {/* Read Indicator */}
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: !msg.isRead ? '#2563EB' : 'transparent',
                  flexShrink: 0,
                  mt: 1
                }} />

                <Avatar sx={{ 
                  bgcolor: '#1E3A8A', 
                  color: 'white',
                  width: 44,
                  height: 44
                }}>
                  {msg.from?.name?.charAt(0) || 'S'}
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: !msg.isRead ? 700 : 500, 
                          color: '#111827'
                        }}
                      >
                        {msg.from?.name || 'STARBOY Support'}
                      </Typography>
                      <Chip 
                        label="Staff"
                        size="small"
                        sx={{ 
                          bgcolor: '#DBEAFE', 
                          color: '#2563EB', 
                          fontSize: '0.65rem',
                          height: 18,
                          fontWeight: 700
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: !msg.isRead ? 700 : 600, 
                      color: '#111827',
                      mb: 0.5
                    }}
                  >
                    {msg.subject}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {msg.content?.substring(0, 150)}...
                  </Typography>

                  {msg.ticketId && (
                    <Chip 
                      label={`Related: #${msg.ticketId.ticketId || msg.ticketId._id?.slice(-4)}`}
                      size="small"
                      sx={{ mt: 1, bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Message Details Dialog */}
      <Dialog 
        open={Boolean(selectedMessage)} 
        onClose={() => setSelectedMessage(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedMessage.subject}
                </Typography>
                <IconButton onClick={() => setSelectedMessage(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              {/* Sender Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, pb: 3, borderBottom: '1px solid #F3F4F6' }}>
                <Avatar sx={{ bgcolor: '#1E3A8A', color: 'white', width: 50, height: 50 }}>
                  {selectedMessage.from?.name?.charAt(0) || 'S'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {selectedMessage.from?.name}
                    </Typography>
                    <Chip 
                      label="Staff"
                      size="small"
                      sx={{ bgcolor: '#DBEAFE', color: '#2563EB', fontSize: '0.7rem', height: 20, fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    From: {selectedMessage.from?.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                    Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Related Ticket */}
              {selectedMessage.ticketId && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', boxShadow: 'none' }}>
                  <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 600, textTransform: 'uppercase' }}>
                    🎫 Related Ticket
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB', mt: 0.5 }}>
                    #{selectedMessage.ticketId.ticketId} - {selectedMessage.ticketId.title}
                  </Typography>
                </Paper>
              )}

              {/* Message Content */}
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.7 }}>
                {selectedMessage.content}
              </Typography>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
              <Button 
                startIcon={<Reply />}
                onClick={() => setReplyOpen(true)}
                variant="contained"
                sx={{ 
                  bgcolor: '#2563EB', 
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
                }}
              >
                Reply
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setSelectedMessage(null)} sx={{ textTransform: 'none' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2563EB', color: 'white' }}>
          Reply to {selectedMessage?.from?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              alert('Reply functionality coming soon!');
              setReplyOpen(false);
              setReplyText('');
            }}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', boxShadow: 'none' }}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default UserInbox;