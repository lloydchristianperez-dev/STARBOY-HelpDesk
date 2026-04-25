import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, Button, Select, MenuItem,
  Chip, LinearProgress, Divider
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AccessTime, CheckCircle, 
  StarBorder, Download, PictureAsPdf, Insights, Close
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../../components/Layout';
import API from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReports = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dateRange, setDateRange] = useState('30days');
  const [chartMode, setChartMode] = useState('incoming');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, customersRes] = await Promise.all([
        API.get('/tickets'),
        API.get('/auth/customers')
      ]);
      setTickets(ticketsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Calculate stats
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length;
  const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0;
  const avgResponseTime = '1h 24m';

  // Prepare chart data (last 30 days)
  const getChartData = () => {
    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const ticketsThisDay = tickets.filter(t => {
        const ticketDate = new Date(t.createdAt);
        return ticketDate >= dayStart && ticketDate <= dayEnd;
      });
      
      data.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        incoming: ticketsThisDay.length,
        resolved: ticketsThisDay.filter(t => t.status === 'closed').length
      });
    }
    return data;
  };

  // Response time pie chart data
  const responseTimeData = [
    { name: 'Standard (<2h)', value: 78, color: '#2563EB' },
    { name: 'Delayed (>4h)', value: 4, color: '#EF4444' },
    { name: 'Within 24h', value: 18, color: '#F59E0B' }
  ];

  // Category resolution rates
  const categoryData = [
    { category: 'Billing & Payments', rate: 98.5, status: 'above' },
    { category: 'Technical Support', rate: 86.2, status: 'below' },
    { category: 'General', rate: 92.0, status: 'above' },
    { category: 'Account', rate: 94.5, status: 'above' }
  ];

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('STARBOY HELPDESK', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('System Performance Report', 14, 30);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
    doc.text(`Period: Last 30 Days`, 14, 42);
    
    // Stats Summary
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value', 'Change']],
      body: [
        ['Total Tickets', totalTickets, '+12.5% vs last month'],
        ['Avg Response Time', avgResponseTime, '-18% improvement'],
        ['Resolution Rate', `${resolutionRate}%`, 'Consistent target'],
        ['Customer Satisfaction', '4.8/5.0', 'Top tier performance'],
        ['Total Customers', customers.length, 'Active users'],
        ['Resolved Tickets', resolvedTickets, 'Successfully closed']
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });
    
    // Category Performance
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resolution Rate by Category', 14, finalY);
    
    doc.autoTable({
      startY: finalY + 5,
      head: [['Category', 'Resolution Rate', 'Status']],
      body: categoryData.map(c => [c.category, `${c.rate}%`, c.status === 'above' ? 'Above Target' : 'Below Target']),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });
    
    // Recent Tickets
    const ticketY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Recent Tickets Activity', 14, ticketY);
    
    doc.autoTable({
      startY: ticketY + 5,
      head: [['Ticket ID', 'Subject', 'Status', 'Priority', 'Date']],
      body: tickets.slice(0, 10).map(t => [
        `#${t.ticketId || t._id?.slice(-4)}`,
        t.title?.substring(0, 30),
        t.status?.toUpperCase(),
        t.priority?.toUpperCase(),
        new Date(t.createdAt).toLocaleDateString()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2026 Starboy Helpdesk', 14, 285);
    doc.text(`Page 1 of 1`, 180, 285);
    
    doc.save(`starboy-report-${Date.now()}.pdf`);
  };

  const chartData = getChartData();
  const todayData = chartData[chartData.length - 1];

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
            Analytics / Operational Reports
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
            System Performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Select
            size="small"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={exportPDF}
            sx={{ 
              bgcolor: '#2563EB', 
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Top Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              Total Tickets
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
              {totalTickets.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                +12.5%
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                vs last month
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              Avg Response Time
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
              {avgResponseTime}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingDown sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                -18%
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                improvement
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              Resolution Rate
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
              {resolutionRate}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                Consistent
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                target
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              Customer Satisfaction
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
              4.8/5.0
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarBorder sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                Top tier
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                performance
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Ticket Volume Bar Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  Ticket Volume over time
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Daily distribution of incoming support requests
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="Incoming" 
                  size="small"
                  onClick={() => setChartMode('incoming')}
                  sx={{ 
                    bgcolor: chartMode === 'incoming' ? '#2563EB' : '#F3F4F6',
                    color: chartMode === 'incoming' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label="Resolved" 
                  size="small"
                  onClick={() => setChartMode('resolved')}
                  sx={{ 
                    bgcolor: chartMode === 'resolved' ? '#2563EB' : '#F3F4F6',
                    color: chartMode === 'resolved' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>

            {todayData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB' }}>
                  {todayData[chartMode]}
                </Typography>
              </Box>
            )}

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey={chartMode} 
                  fill="#2563EB" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Response Time Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
              Average Response Time
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Response distribution
            </Typography>

            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', my: 2 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={responseTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {responseTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>84m</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>AVERAGE</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              {responseTimeData.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.8rem' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Resolution Rate by Category */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  Resolution Rate
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Ticket closure efficiency by category
                </Typography>
              </Box>
              <Chip 
                label="ABOVE TARGET" 
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            {categoryData.map((cat) => (
              <Box key={cat.category} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {cat.category}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {cat.rate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={cat.rate}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: '#F3F4F6',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: cat.status === 'above' ? '#10B981' : '#F59E0B'
                    }
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* AI Insight */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            boxShadow: 'none',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Insights sx={{ color: '#2563EB' }} />
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  AI Insight
                </Typography>
              </Box>
              <Close sx={{ fontSize: 18, color: '#6B7280', cursor: 'pointer' }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 1 }}>
              Response times are 12% faster during morning shifts
            </Typography>
            <Typography variant="body2" sx={{ color: '#3B82F6', mb: 2, fontSize: '0.85rem' }}>
              Consider increasing staffing between 2-5 PM to improve afternoon response rates.
            </Typography>

            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#2563EB',
                textTransform: 'none',
                boxShadow: 'none',
                mr: 1,
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
              }}
            >
              View Full Analysis
            </Button>
            <Button sx={{ textTransform: 'none', color: '#6B7280' }}>
              Dismiss insight
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#9CA3AF', letterSpacing: 1 }}>
          LAST DATA SYNC: 2 MINUTES AGO
        </Typography>
      </Box>
    </Layout>
  );
};

export default AdminReports;