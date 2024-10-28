import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

// Define months (in case they are not dynamically fetched)
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthlyStatement({ userId }) {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get(`/api/user/transactions`, {
        params: { month, year: new Date().getFullYear() }
      });
      setTransactions(response.data);
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        console.error('Error fetching transactions', error);
      }
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth); // Fetch transactions when the month changes or component loads
  }, [selectedMonth]);

  const totalIncome = transactions
    ? transactions.filter((txn) => txn.type === 'deposit').reduce((acc, txn) => acc + txn.amount, 0)
    : 0;

  const totalExpenses = transactions
    ? transactions.filter((txn) => txn.type === 'withdrawal').reduce((acc, txn) => acc + txn.amount, 0)
    : 0;

  if (errorMessage) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" color="error">
          {errorMessage}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
          Monthly Bank Statement
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3, color: '#fff' }}>
          Go Back
        </Button>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: '#fff' }}>Select Month</InputLabel>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} sx={{ color: '#fff' }}>
            {months.map((month, index) => (
              <MenuItem key={index} value={index + 1}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 4, color: '#fff' }}>
          <Typography variant="h6">Summary for {months[selectedMonth - 1]}:</Typography>
          <Typography variant="body1">Total Income: ${totalIncome}</Typography>
          <Typography variant="body1">Total Expenses: ${totalExpenses}</Typography>
        </Box>

        {/* Render charts and details... */}
      </Container>
    </Box>
  );
}

export default MonthlyStatement;
