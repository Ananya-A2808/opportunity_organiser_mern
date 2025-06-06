import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, CardActionArea, Button, Box
} from '@mui/material';
import axios from 'axios';

const Categories = () => {
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const email = sessionStorage.getItem('email');

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/email/categories?email=${encodeURIComponent(email)}`);
        setCounts(res.data.counts || {});
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [email, navigate]);

  const categories = Object.keys(counts);

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Email Opportunity Categories
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Emails Analyzed: {total}
      </Typography>
      <Grid container spacing={3}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : categories.length === 0 ? (
          <Typography>No categories found.</Typography>
        ) : (
          categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category}>
              <Card>
                <CardActionArea onClick={() => navigate(`/opportunities/${category.toLowerCase()}`)}>
                  <CardContent sx={{ padding: 2 }}>
                    <Typography variant="h6" sx={{ marginBottom: 1 }}>{category}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{counts[category]} opportunities</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/resume')}>
          Go to Resume Builder
        </Button>
      </Box>
    </Container>
  );
};

export default Categories;
