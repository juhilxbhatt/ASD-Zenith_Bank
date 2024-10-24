import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Paper, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

function TransferDeposit() {
  const [transactionType, setTransactionType] = useState('transfer');
  const [payees, setPayees] = useState([]); // Payees list fetched dynamically
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newRecipientVisible, setNewRecipientVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch payees for the logged-in user from the backend
  useEffect(() => {
    const fetchPayees = async () => {
      try {
        const response = await axios.get('/api/user/payees');  // Endpoint that fetches user payees
        setPayees(response.data.payees || []);
      } catch (error) {
        console.error('Error fetching payees:', error);
      }
    };

    fetchPayees();
  }, []);

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
      recipient: transactionType === 'transfer' ? (newRecipient ? newRecipient : payees.find((r) => r._id === recipient).name) : 'Self',
    };

    try {
      await axios.post(`/api/user/transaction`, newTransaction);
      setTransactionHistory([newTransaction, ...transactionHistory]);
      setAlertMessage(`${transactionType === 'transfer' ? 'Transfer' : 'Deposit'} of $${amount} completed successfully!`);
      setShowSnackbar(true);

      // Reset form
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
    <Box>
      {/* UI layout remains the same */}
      {/* The dynamically fetched payees are now rendered in the recipient selection */}
    </Box>
  );
}

export default TransferDeposit;
