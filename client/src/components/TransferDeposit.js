import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Snackbar, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

function TransferDeposit() {
  const [transactionType, setTransactionType] = useState('transfer');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // Add error state to handle error message
  const navigate = useNavigate();

  // Fetch payees from MongoDB via Flask backend
  const fetchPayees = async () => {
    try {
      const response = await axios.get('/api/user/payees');
      // Handle the response data here
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        console.error('Error fetching payees', error);
      }
    }
  };

  useEffect(() => {
    fetchPayees(); // Fetch payees when the component loads
  }, []);

  if (errorMessage) {
    // Display the error message in red text
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h4" align="center" gutterBottom color="error">
          {errorMessage}
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)', // Apply background here
        minHeight: '100vh',
        py: 10,
      }}
    >
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff' }}>
          Transfer & Deposit
        </Typography>

        {/* Go Back Button */}
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
          Go Back
        </Button>

        <Paper elevation={4} sx={{ p: 4, mb: 5 }}>
          <Grid container spacing={4}>
            {/* Transaction form elements */}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default TransferDeposit;
