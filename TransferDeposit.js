import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Paper, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

// Mock data for saved recipients
const savedRecipients = [
  { id: '123456', name: 'John Doe' },
  { id: '654321', name: 'Jane Smith' },
  { id: '789012', name: 'Acme Corp' },
];

function TransferDeposit({ userId }) {
  const [transactionType, setTransactionType] = useState('transfer'); // Either 'transfer' or 'deposit'
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newRecipient, setNewRecipient] = useState(''); // New recipient input for transfers
  const [scheduledDate, setScheduledDate] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]); // List of completed transactions
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newRecipientVisible, setNewRecipientVisible] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleTransaction = async () => {
    if (!amount || amount <= 0 || (transactionType === 'transfer' && !recipient && !newRecipient)) {
      setAlertMessage('Please enter a valid amount and recipient details.');
      setShowSnackbar(true);
      return;
    }

    const newTransaction = {
      type: transactionType,
      amount: parseFloat(amount),
      date: scheduledDate ? scheduledDate.format('YYYY-MM-DD') : new Date().toLocaleDateString(),
      category: transactionType === 'transfer' ? 'Transfer' : 'Deposit',
      recipient: transactionType === 'transfer' ? (newRecipient ? newRecipient : savedRecipients.find((r) => r.id === recipient).name) : 'Self',
    };

    try {
      // Submit transaction to MongoDB via Flask API
      await axios.post(`/api/user/${userId}/transaction`, newTransaction);
      setTransactionHistory([newTransaction, ...transactionHistory]);
      setAlertMessage(`${transactionType === 'transfer' ? 'Transfer' : 'Deposit'} of $${amount} completed successfully!`);
      setShowSnackbar(true);

      // Reset the form
      setRecipient('');
      setNewRecipient('');
      setAmount('');
      setScheduledDate(null);
      setNewRecipientVisible(false);
    } catch (error) {
      console.error('Error submitting transaction', error);
      setAlertMessage('Transaction failed. Please try again.');
      setShowSnackbar(true);
    }
  };

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
                  {savedRecipients.map((recipient) => (
                    <MenuItem key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">Add New Recipient</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* New Recipient Input (visible when "Add New Recipient" is selected) */}
            {newRecipientVisible && transactionType === 'transfer' && (
              <TextField
                label="New Recipient Name"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
            )}

            {/* Amount Input */}
            <TextField
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Scheduled Date (Optional) */}
            <DatePicker
              label="Schedule Transfer (optional)"
              value={scheduledDate}
              onChange={(newDate) => setScheduledDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />

            {/* Submit Button */}
            <Button variant="contained" color="success" fullWidth onClick={handleTransaction}>
              {transactionType === 'transfer' ? 'Transfer' : 'Deposit'}
            </Button>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <Paper elevation={2} sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
              {transactionHistory.length === 0 ? (
                <Typography variant="body2">No transactions yet.</Typography>
              ) : (
                transactionHistory.map((txn, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {txn.date} - {txn.type === 'transfer' ? `Transfer to ${txn.recipient}` : 'Deposit'} - ${txn.amount}
                    </Typography>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar for transaction success message */}
      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TransferDeposit;