import React, { useState } from 'react';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import TransactionHistory from './TransactionHistory'; // Importing a hypothetical TransactionHistory component

function TransferDeposit() {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('transfer');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const handleTransaction = () => {
    if (!amount || amount <= 0 || (operation === 'transfer' && !recipientId)) {
      setAlertMessage('Please enter a valid amount and recipient ID.');
      setShowAlert(true);
      return;
    }

    const newTransaction = {
      type: operation,
      recipientId: recipientId || 'Self',
      amount: parseFloat(amount),
      date: scheduledDate ? scheduledDate.format('YYYY-MM-DD') : new Date().toLocaleDateString(),
    };

    setTransactionHistory([newTransaction, ...transactionHistory]);
    setAlertMessage(`Transaction successful: ${operation === 'transfer' ? 'Transfer' : 'Deposit'} of $${amount}`);
    setShowAlert(true);

    // Reset the fields
    setRecipientId('');
    setAmount('');
    setScheduledDate(null);
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        {/* Operation Type Selection */}
        <FormControl fullWidth>
          <InputLabel>Operation</InputLabel>
          <Select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <MenuItem value="transfer">Transfer</MenuItem>
            <MenuItem value="deposit">Deposit</MenuItem>
          </Select>
        </FormControl>

        {/* Recipient ID (Only for Transfer) */}
        {operation === 'transfer' && (
          <TextField
            label="Recipient ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            variant="outlined"
            fullWidth
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
        />

        {/* Scheduled Date (Optional) */}
        <DatePicker
          label="Schedule Transfer (optional)"
          value={scheduledDate}
          onChange={(newDate) => setScheduledDate(newDate)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />

        {/* Submit Button */}
        <Button variant="contained" color="success" onClick={handleTransaction} sx={{ py: 2 }}>
          {operation === 'transfer' ? 'Transfer' : 'Deposit'}
        </Button>
      </Box>

      {/* Snackbar Alert */}
      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Transactions:
          </Typography>
          <TransactionHistory transactions={transactionHistory} />
        </Box>
      )}
    </Container>
  );
}

export default TransferDeposit;