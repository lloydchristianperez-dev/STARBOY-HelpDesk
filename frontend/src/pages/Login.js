import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, InputAdornment, Divider, IconButton } from '@mui/material';
import { Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userData;
      if (isRegister) {
        userData = await register(formData.name, formData.email, formData.password);
      } else {
        userData = await login(formData.email, formData.password);
      }
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F9FAFB' }}>
      {/* Left Side - Blue Gradient Panel */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ 
          position: 'absolute', 
          top: -100, 
          right: -100, 
          width: 300, 
          height: 300, 
          borderRadius: '50%', 
          bgcolor: 'rgba(255,255,255,0.05)' 
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -50, 
          left: -50, 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          bgcolor: 'rgba(255,255,255,0.05)' 
        }} />

        <Box sx={{ textAlign: 'center', maxWidth: 500, zIndex: 1 }}>
          {/* Logo */}
          <Box sx={{ mb: 4 }}>
            <img 
              src="/logo.png" 
              alt="STARBOY" 
              style={{ width: 200, height: 'auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
            The Starboy Workspace
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 5, fontSize: '1.1rem' }}>
            A unified platform for support, follow-ups, and team efficiency.
          </Typography>

          {/* Testimonial Card */}
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
            textAlign: 'left'
          }}>
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'white' }}>
              "Starboy has completely transformed how we handle customer support. The interface is clean, fast, and intuitive."
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: '#FED7AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9A3412',
                fontWeight: 700
              }}>
                Z
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                  Zaki Gervero
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Senior Support Agent
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Right Side - Form */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 4,
        bgcolor: '#FFFFFF'
      }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <img src="/logo.png" alt="STARBOY" style={{ width: 120 }} onError={(e) => e.target.style.display = 'none'} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
            {isRegister ? 'Join Starboy Helpdesk today' : 'Log in to your Starboy account'}
          </Typography>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem' }}>
            👤 Customer: email@gmail.com<br />
            🛠️ Staff: email@starboy.com
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {isRegister && (
              <TextField
                label="Full Name"
                fullWidth
                required
                margin="normal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person sx={{ color: '#9CA3AF' }} /></InputAdornment>
                }}
              />
            )}
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email sx={{ color: '#9CA3AF' }} /></InputAdornment>
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#9CA3AF' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                bgcolor: '#2563EB',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
              }}
            >
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                fontWeight: 500,
                textTransform: 'none',
                color: '#374151',
                borderColor: '#E5E7EB',
                borderRadius: 2,
                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, marginRight: 12 }} />
              Sign up with Google
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: '#6B7280' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#2563EB', p: 0 }}
              >
                {isRegister ? 'Sign In' : 'Create an Account'}
              </Button>
            </Typography>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: '#9CA3AF' }}>
              © 2026 Starboy Helpdesk · <a href="#" style={{ color: '#6B7280' }}>Terms</a> · <a href="#" style={{ color: '#6B7280' }}>Privacy Policy</a>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;