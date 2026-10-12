import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { ArrowBack, Email as EmailIcon } from '@mui/icons-material';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Calling the backend forgot-password endpoint
      await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${email}`);
      setMessage({
        type: 'success',
        text: 'A password reset link has been sent to your email. Please check your inbox (and spam folder).'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
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
          <Box sx={{ mb: 2 }}>
            <IconButton component={Link} to="/login" size="small">
              <ArrowBack />
            </IconButton>
          </Box>

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
              <EmailIcon sx={{ color: 'primary.dark', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No worries! Enter your email and we'll send you a link to reset your password.
            </Typography>
          </Box>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              placeholder="Enter your registered email"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || (message.type === 'success')}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
