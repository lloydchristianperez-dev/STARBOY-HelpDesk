import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Shared Pages
import Login from './pages/Login';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import AdminFollowups from './pages/admin/AdminFollowups';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReports from './pages/admin/AdminReports';

// User Pages
import Dashboard from './pages/Dashboard';
import UserMyTicket from './pages/user/UserMyTicket';
import UserTicketReports from './pages/user/UserTicketReports';
import UserInbox from './pages/user/UserInbox';
import UserProfile from './pages/user/UserProfile';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" />;
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  }
  
  return children;
};

// Main App Layout
const AppLayout = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} 
      />
      
      {/* ========== ADMIN ROUTES ========== */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/tickets" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTickets />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/followups" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminFollowups />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/customers" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminCustomers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      {/* ========== USER ROUTES ========== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/my-ticket" 
        element={
          <ProtectedRoute requiredRole="user">
            <UserMyTicket />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/reports" 
        element={
          <ProtectedRoute requiredRole="user">
            <UserTicketReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/inbox" 
        element={
          <ProtectedRoute requiredRole="user">
            <UserInbox />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/profile" 
        element={
          <ProtectedRoute requiredRole="user">
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute requiredRole="user">
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;