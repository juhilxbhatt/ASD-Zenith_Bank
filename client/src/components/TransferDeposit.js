import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Paper, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

function TransferDeposit() {
  const [transactionType, setTransactionType] = useState('transfer'); // Either 'transfer' or 'deposit'
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newRecipient, setNewRecipient] = useState(''); // New recipient input for transfers
  const [scheduledDate, setScheduledDate] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]); // List of completed transactions
  const [accounts, setAccounts] = useState([]); // List of user accounts
  const [selectedAccount, setSelectedAccount] = useState(''); // Account selected by the user
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newRecipientVisible, setNewRecipientVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch user accounts on component mount
  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await axios.get('/api/user_accounts');
           if (response.data && response.data.Accounts) {
          setAccounts(response.data.Accounts);
        } else {
          console.error("No accounts found for this user.");
        }
      } catch (error) {
        console.error("Error fetching user accounts:", error);
      }
    };

    fetchUserAccounts();
  }, []);

  // Handle form submission
  // Handle form submission
  const handleTransaction = async () => {
    if (!amount || amount <= 0 || (transactionType === 'transfer' && !recipient && !newRecipient)) {
      setAlertMessage('Please enter a valid amount and recipient details.');
      setShowSnackbar(true);
      return;
    }
  
    const formattedDate = scheduledDate
      ? (scheduledDate instanceof Date ? scheduledDate.toLocaleDateString() : scheduledDate.format('YYYY-MM-DD'))
      : new Date().toLocaleDateString();
  
    const newTransaction = {
      type: transactionType,
      amount: parseFloat(amount),
      date: formattedDate,
      category: transactionType === 'transfer' ? 'Transfer' : 'Deposit',
      recipient: transactionType === 'transfer' ? recipient : null,  // Add recipient if it's a transfer
      accountId: selectedAccount  // Include the selected account ID
    };
  
    try {
      const response = await axios.post(`/api/user/${userId}/transaction`, newTransaction);
      if (response.status === 201) {
        setTransactionHistory([newTransaction, ...transactionHistory]);
        setAlertMessage(`${transactionType === 'transfer' ? 'Transfer' : 'Deposit'} of $${amount} completed successfully!`);
      } else {
        setAlertMessage('Transaction failed. Please try again.');
      }
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
  


  return (
    <Box sx={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', minHeight: '100vh', py: 10 }}>
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
            <Grid item xs={12} sm={6}>
              {/* Transaction Type Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                  <MenuItem value="transfer">Transfer</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                </Select>
              </FormControl>

              {/* Account Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Account</InputLabel>
                <Select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountType} - Balance: ${account.balance}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Recipient Selection (for Transfer) */}
              {transactionType === 'transfer' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Recipient</InputLabel>
                  <Select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                    <MenuItem value="" disabled>Select Recipient</MenuItem>
                    {/* Add saved recipients here or implement an API call to fetch recipients */}
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
          </Grid>
        </Paper>

        {/* Snackbar for transaction success message */}
        <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)}>
          <Alert severity="success" sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default TransferDeposit;
