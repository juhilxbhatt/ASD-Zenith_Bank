import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TransferDeposit() {
  const { isAuthenticated } = useAuth();
  const [transactionType, setTransactionType] = useState('transfer');
  const [amount, setAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login-page');
      return;
    }
    fetchUserAccounts();
  }, [isAuthenticated, navigate]);

  const fetchUserAccounts = async () => {
    try {
      const response = await axios.get('/api/user_accounts');
      setAccounts(response.data.Accounts || []);
    } catch (error) {
      console.error("Error fetching user accounts:", error);
    }
  };

  const handleTransaction = async () => {
    if (!amount || amount <= 0 || !selectedAccount || (transactionType === 'transfer' && !recipientAccount)) {
      setAlertMessage('Please enter a valid amount and select the necessary accounts.');
      setShowSnackbar(true);
      return;
    }

    const userId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_id='))
      ?.split('=')[1];

    if (!userId) {
      setAlertMessage('User not logged in.');
      setShowSnackbar(true);
      return;
    }

    const date = new Date().toISOString().split('T')[0];

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

        <Button variant="outlined" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
          Go Back
        </Button>

        <Paper elevation={4} sx={{ p: 4, mb: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                  <MenuItem value="transfer">Transfer</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                </Select>
              </FormControl>

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

              <TextField
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />

              <Button variant="contained" color="success" fullWidth onClick={handleTransaction}>
                {transactionType === 'transfer' ? 'Transfer' : 'Deposit'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

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
