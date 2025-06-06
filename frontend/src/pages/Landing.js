import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const Landing = () => {
  const navigate = useNavigate();

  const email = sessionStorage.getItem('email');
  const appPassword = sessionStorage.getItem('appPassword');

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!email || !appPassword) {
      navigate('/register');
    }
  }, [email, appPassword, navigate]);

  const handleAnalyzeEmails = async () => {
    if (!email || !appPassword) {
      alert('Email or app password missing. Please login again.');
      navigate('/register');
      return;
    }
    setLoading(true);
    try {
      // Call backend to fetch and analyze emails
      const response = await axios.post('http://localhost:5000/api/email/fetch', { email, appPassword });
      console.log('Fetch emails response:', response.data);
      // After fetching, navigate to categories page
      navigate('/categories');
    } catch (error) {
      console.error('Error fetching emails:', error);
      alert('Failed to fetch emails. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Email & Resume Manager
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mr: 2 }}
          onClick={handleAnalyzeEmails}
          disabled={loading}
        >
          {loading ? (
            <>
              Analyzing... <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />
            </>
          ) : (
            'Analyze Emails'
          )}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => navigate('/resume')}
          disabled={loading}
        >
          Resume Builder
        </Button>
      </Box>
    </Container>
  );
};

export default Landing;
