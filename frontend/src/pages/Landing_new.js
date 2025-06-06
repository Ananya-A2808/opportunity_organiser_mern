import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, CircularProgress, Paper, Grid } from '@mui/material';
import axios from 'axios';
import Footer from '../components/Footer';

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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#121212',
        p: 3,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          maxWidth: 600,
          p: 4,
          mb: 8,
          bgcolor: 'rgba(18, 18, 18, 0.85)',
          boxShadow: '0 0 20px #e0e0e0',
          borderRadius: 3,
          textAlign: 'center',
          margin: '0 auto',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            color: '#e0e0e0',
            textShadow: '0 0 10px #e0e0e0',
            fontWeight: 'bold',
          }}
        >
          Welcome to Opportunity Organiser
        </Typography>
        <Box sx={{ mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              mr: 2,
              boxShadow: '0 0 10px #e0e0e0',
              '&:hover': {
                boxShadow: '0 0 20px #e0e0e0',
              },
            }}
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
            sx={{
              boxShadow: '0 0 10px #e0e0e0',
              '&:hover': {
                boxShadow: '0 0 20px #e0e0e0',
              },
            }}
            onClick={() => navigate('/resume')}
            disabled={loading}
          >
            Resume Builder
          </Button>
        </Box>
      </Paper>
      
      
        <Box sx={{ mt: 8, maxWidth: 900, margin: '0 auto' }}>
        <Grid container spacing={4} alignItems="center" sx={{ mt: 8 }}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
              alt="Info 1"
              sx={{ width: '100%', borderRadius: 2, boxShadow: '0 0 15px #e0e0e0' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ color: '#e0e0e0', mb: 2, textShadow: '0 0 10px #e0e0e0' }}>
              What is Opportunity Organiser?
            </Typography>
            <Typography sx={{ color: '#e0e0e0' }}>
              Opportunity Organiser helps you manage your emails and resumes efficiently. Analyze your emails to find opportunities and build professional resumes with ease.
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={4} alignItems="center" sx={{ mt: 8 }}>
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Typography variant="h5" sx={{ color: '#e0e0e0', mb: 2, textShadow: '0 0 10px #e0e0e0' }}>
              Easy Resume Builder
            </Typography>
            <Typography sx={{ color: '#e0e0e0' }}>
              Create modern and professional resumes with our easy-to-use builder. Upload your profile image and get suggestions for skills and summaries.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
              alt="Info 2"
              sx={{ width: '100%', borderRadius: 2, boxShadow: '0 0 15px #e0e0e0' }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={4} alignItems="center" sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
              alt="Info 3"
              sx={{ width: '100%', borderRadius: 2, boxShadow: '0 0 15px #e0e0e0' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ color: '#e0e0e0', mb: 2, textShadow: '0 0 10px #e0e0e0' }}>
              Find Opportunities
            </Typography>
            <Typography sx={{ color: '#e0e0e0' }}>
              Discover and explore various opportunities categorized for your convenience. Stay updated and never miss a chance.
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </Box>
  );
};

export default Landing;
