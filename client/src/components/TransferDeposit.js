import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Utility function to get a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function TransferDeposit() {
  const [transactionType, setTransactionType] = useState('transfer'); // Either 'transfer' or 'deposit'
  const [amount, setAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]); // List of completed transactions
  const [accounts, setAccounts] = useState([]); // List of user accounts
  const [selectedAccount, setSelectedAccount] = useState(''); // Account selected by the user
  const [recipientAccount, setRecipientAccount] = useState(''); // Recipient account for transfers
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  // Retrieve userId from the cookies
  const userId = getCookie('user_id');

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
  const handleTransaction = async () => {
    if (!userId) {
      setAlertMessage('User not logged in.');
      setShowSnackbar(true);
      return;
    }

    if (!amount || amount <= 0 || !selectedAccount || (transactionType === 'transfer' && !recipientAccount)) {
      setAlertMessage('Please enter a valid amount and select the necessary accounts.');
      setShowSnackbar(true);
      return;
    }

    const date = new Date().toISOString().split('T')[0]; // Use current date if scheduledDate is not provided

    const newTransaction = {
      type: transactionType,
      amount: parseFloat(amount),
      date: date,
      category: transactionType === 'transfer' ? 'Transfer' : 'Deposit',
      recipient: transactionType === 'transfer' ? recipientAccount : null,
      accountId: selectedAccount
    };

    try {
      const response = await axios.post(`/api/user/${userId}/transaction`, newTransaction);
      if (response.status === 201) {
        setTransactionHistory([newTransaction, ...transactionHistory]);
        setAlertMessage(`${transactionType === 'transfer' ? 'Transfer' : 'Deposit'} of $${amount} completed successfully!`);
      } else if (response.data && response.data.error) {
        setAlertMessage(`Transaction failed: ${response.data.error}`);
      } else {
        setAlertMessage('Transaction failed. Please try again.');
      }
      setShowSnackbar(true);

      // Reset the form
      setAmount('');
      setRecipientAccount('');
      setSelectedAccount('');
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setAlertMessage(`Transaction failed: ${error.response?.data?.error || error.message}`);
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

              {/* Recipient Account Selection for Transfer */}
              {transactionType === 'transfer' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Recipient Account</InputLabel>
                  <Select value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)}>
                    {accounts
                      .filter(account => account.id !== selectedAccount)
                      .map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.accountType} - Balance: ${account.balance}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
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
