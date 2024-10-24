import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Paper, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

function TransferDeposit({ userId }) {
  const [transactionType, setTransactionType] = useState('transfer'); // Either 'transfer' or 'deposit'
  const [payees, setPayees] = useState([]);  // List of payees fetched from the server
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newRecipient, setNewRecipient] = useState(''); // New recipient input for transfers
  const [scheduledDate, setScheduledDate] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]); // List of completed transactions
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newRecipientVisible, setNewRecipientVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch payees for the user from the backend
  useEffect(() => {
    const fetchPayees = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}/payees`);
        setPayees(response.data.payees || []);
      } catch (error) {
        console.error('Error fetching payees:', error);
      }
    };

    fetchPayees();
  }, [userId]);

  // Handle recipient selection
  const handleRecipientChange = (e) => {
    if (e.target.value === 'new') {
      setNewRecipientVisible(true);
      setRecipient('');
    } else {
      setRecipient(e.target.value);
      setNewRecipientVisible(false);
    }
  };

  const handleTransaction = async () => {
    // (Handle the transaction logic, same as before...)
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Transfer & Deposit
      </Typography>

      {/* Go Back Button */}
      <Button variant="outlined" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Go Back
      </Button>

      <Paper elevation={4} sx={{ p: 4, mb: 5 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            {/* Transaction Type Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Transaction Type</InputLabel>
              <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
              </Select>
            </FormControl>

            {/* Recipient Selection (for Transfer) */}
            {transactionType === 'transfer' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Recipient</InputLabel>
                <Select value={recipient} onChange={handleRecipientChange}>
                  <MenuItem value="" disabled>
                    Select Recipient
                  </MenuItem>
                  {payees.map((payee) => (
                    <MenuItem key={payee.id} value={payee.id}>
                      {payee.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">Add New Recipient</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* (Other form inputs and submit button logic remain unchanged...) */}
          </Grid>
          {/* (Transaction History and other parts remain unchanged...) */}
        </Grid>
      </Paper>
    </Container>
  );
}

export default TransferDeposit;
