import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Button, Collapse, Box, Link
} from '@mui/material';
import axios from 'axios';

const Opportunities = () => {
  const { category } = useParams();
  const [opportunities, setOpportunities] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const email = sessionStorage.getItem('email');

  // Helper function to extract summary (first 2-3 sentences) from HTML string
  const extractSummary = (html) => {
    if (!html) return '';
    // Remove HTML tags and split into sentences
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    let summary = sentences.slice(0, 3).join(' ');
    if (summary.length > 300) {
      summary = summary.substring(0, 300) + '...';
    }
    return summary;
  };

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    const fetchOpportunities = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/email/opportunities/${category}?email=${encodeURIComponent(email)}`);
        console.log('Fetch opportunities response:', res.data);
        setOpportunities(res.data.opportunities || []);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, [category, email, navigate]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        {category.charAt(0).toUpperCase() + category.slice(1)} Opportunities
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : opportunities.length === 0 ? (
        <Typography>No opportunities found.</Typography>
      ) : (
        opportunities.map((opp, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{opp.subject}</Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                From: {opp.from} | Received: {new Date(opp.date).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Deadline:</strong> {opp.deadline || 'Not found'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Eligibility:</strong> {opp.eligibility || 'Not mentioned'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Application Link: </strong>
                {opp.application_link && opp.application_link !== 'Not provided' ? (
                  <Link href={opp.application_link} target="_blank" rel="noopener noreferrer">
                    {opp.application_link}
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {expandedIndex === index ? (
                  <Box dangerouslySetInnerHTML={{ __html: opp.highlightedDescription || opp.body }} />
                ) : (
                  extractSummary(opp.highlightedDescription || opp.body)
                )}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" onClick={() => toggleExpand(index)}>
                  {expandedIndex === index ? 'Read Less' : 'Read More'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/categories')}>
          Back to Categories
        </Button>
        <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/resume')}>
          Go to Resume Builder
        </Button>
      </Box>
    </Container>
  );
};

export default Opportunities;
