import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle messages from both Register (state) and Email Verification (query params)
  const getInitialMessage = () => {
    // 1. Check navigation state (from Register)
    if (location.state?.message) return { type: 'success', text: location.state.message };

    // 2. Check query parameters (from Email Verification redirect)
    const params = new URLSearchParams(location.search);
    const verifiedStatus = params.get('verified');
    
    if (verifiedStatus === 'success') return { type: 'success', text: 'Email verified successfully! You can now log in.' };
    if (verifiedStatus === 'already') return { type: 'info', text: 'Your email is already verified. Please log in.' };
    if (verifiedStatus === 'error') return { type: 'error', text: 'Email verification failed. The link may be invalid or expired.' };
    
    const resetStatus = params.get('reset');
    if (resetStatus === 'success') return { type: 'success', text: 'Password reset successful! Please log in with your new password.' };
    
    return { type: '', text: '' };
  };

  const [message, setMessage] = useState(getInitialMessage());
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Login failed';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.light',
                width: 56,
                height: 56,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LoginIcon sx={{ color: 'primary.dark', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Login to your Coconut Farm dashboard
            </Typography>
          </Box>

          {message.text && (
            <Alert severity={message.type || 'info'} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right', mt: 0.5 }}>
              <Link to="/forgot-password" style={{ color: '#2e7d32', fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
