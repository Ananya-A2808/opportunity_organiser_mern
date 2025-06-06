import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box, Alert
} from '@mui/material';
import axios from 'axios';

const Registration = () => {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !appPassword) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { email, appPassword });
      if (res.data.message === 'OTP sent to email') {
        sessionStorage.setItem('pendingEmail', email);
        sessionStorage.setItem('pendingAppPassword', appPassword);
        navigate('/verify-otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="App Password"
          type="password"
          fullWidth
          margin="normal"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          required
          helperText="Use your Gmail app password for IMAP/SMTP"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Sending OTP...' : 'Register'}
        </Button>
      </Box>
    </Container>
  );
};

export default Registration;
