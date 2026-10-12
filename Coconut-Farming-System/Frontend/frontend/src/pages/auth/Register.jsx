import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: ['FARMER'],
    officerId: '',
    district: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage({ type: '', text: '' });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      roles: [role],
      officerId: role === 'FARMER' ? '' : formData.officerId,
      district: role === 'FARMER' ? '' : formData.district,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await register(formData);
      const isFarmer = formData.roles.includes('FARMER') || !formData.roles.includes('OFFICER');
      
      // Redirect immediately to login with the message in state
      navigate('/login', { 
        state: { 
          message: isFarmer 
            ? `Registration successful! Please check your email (${formData.email}) to verify your account.` 
            : 'Registration successful! Your account is pending admin approval.' 
        } 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const isOfficer = formData.roles.includes('OFFICER');

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
      <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 3 }}>
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
              <PersonAdd sx={{ color: 'primary.dark', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the Coconut Farming Management System
            </Typography>
          </Box>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
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

            <TextField
              fullWidth
              select
              label="Role"
              value={formData.roles[0]}
              onChange={handleRoleChange}
              margin="normal"
            >
              <MenuItem value="FARMER">Farmer</MenuItem>
              <MenuItem value="OFFICER">Agriculture Officer</MenuItem>
            </TextField>

            {isOfficer && (
              <>
                <TextField
                  fullWidth
                  label="Officer ID"
                  name="officerId"
                  value={formData.officerId}
                  onChange={handleChange}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  select
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  margin="normal"
                  required
                >
                  {DISTRICTS.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none' }}>
              Login here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
