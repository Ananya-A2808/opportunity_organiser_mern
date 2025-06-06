import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box, Alert
} from '@mui/material';
import axios from 'axios';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = sessionStorage.getItem('pendingEmail');
  const appPassword = sessionStorage.getItem('pendingAppPassword');

  if (!email || !appPassword) {
    navigate('/register');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      if (res.data.message === 'OTP verified successfully') {
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('appPassword', appPassword);
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('pendingAppPassword');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Enter OTP
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="OTP"
          type="text"
          fullWidth
          margin="normal"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </Box>
    </Container>
  );
};

export default OtpVerification;
