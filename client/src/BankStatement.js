import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function BankStatement() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        minHeight: '100vh',
        py: 10,
        color: '#fff',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Bank Statement
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 6 }}>
          Review your detailed bank statements for any period.
        </Typography>

        {/* Dummy content - you can replace this with actual bank statement details */}
        <Box
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            p: 3,
            boxShadow: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Recent Transactions
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            - $500 credited on 1st October 2024 <br />
            - $120 debited on 3rd October 2024 <br />
            - $250 credited on 5th October 2024 <br />
            {/* Add more statements as necessary */}
          </Typography>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" size="large">
              Back to Home
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default BankStatement;