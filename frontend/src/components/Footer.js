import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1e1e1e',
        color: '#b0b0b0',
        textAlign: 'center',
        p: 3,
        mt: 6,
        boxShadow: '0 -2px 10px #2c2c2c',
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; {new Date().getFullYear()} Opportunity Organiser. All rights reserved.
      </Typography>
      <Typography variant="body2">
        Contact us: <Link href="mailto:support@opportunityorganiser.com" color="inherit">support@opportunityorganiser.com</Link> | Phone: +1 (555) 123-4567
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Follow us on{' '}
        <Link href="https://twitter.com/opportunityorg" target="_blank" rel="noopener" color="inherit">
          Twitter
        </Link>{' '}
        |{' '}
        <Link href="https://facebook.com/opportunityorg" target="_blank" rel="noopener" color="inherit">
          Facebook
        </Link>{' '}
        |{' '}
        <Link href="https://linkedin.com/company/opportunityorg" target="_blank" rel="noopener" color="inherit">
          LinkedIn
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
