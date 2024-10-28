import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const months = [
  { name: 'January', value: 1 },
  { name: 'February', value: 2 },
  { name: 'March', value: 3 },
  { name: 'April', value: 4 },
  { name: 'May', value: 5 },
  { name: 'June', value: 6 },
  { name: 'July', value: 7 },
  { name: 'August', value: 8 },
  { name: 'September', value: 9 },
  { name: 'October', value: 10 },
  { name: 'November', value: 11 },
  { name: 'December', value: 12 },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  boxShadow: theme.shadows[4],
  borderRadius: '15px',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'scale(1.03)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
}));

function MonthlyStatement() {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get('/api/user/transactions', {
        params: { month, year: new Date().getFullYear() },
      });
      setTransactions(response.data);
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Error fetching transactions. Please try logging in.");
      }
    }
  };

  useEffect(() => {
    axios.get('/api/check_authentication')
      .then(() => {
        fetchTransactions(selectedMonth);
      })
      .catch(() => {
        setErrorMessage("User ID not found in cookies. Please log in to access this page.");
      });
  }, [selectedMonth]);

  const totalIncome = transactions
    .filter((txn) => txn.type === 'deposit')
    .reduce((acc, txn) => acc + txn.amount, 0);

  const totalExpenses = transactions
    .filter((txn) => txn.type === 'withdrawal')
    .reduce((acc, txn) => acc + txn.amount, 0);

  if (errorMessage) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" color="error">
          {errorMessage}
        </Typography>
      </Container>
    );
  }

  const lineChartData = {
    labels: transactions.map((txn) => txn.date),
    datasets: [
      { label: 'Income', data: transactions.filter((txn) => txn.type === 'deposit').map((txn) => txn.amount) },
      { label: 'Expenses', data: transactions.filter((txn) => txn.type === 'withdrawal').map((txn) => txn.amount) },
    ],
  };

  return (
    <Box sx={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff' }}>Monthly Bank Statement</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>Go Back</Button>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Month</InputLabel>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>{month.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 4, color: '#fff' }}>
          <Typography variant="h6">Summary for {months[selectedMonth - 1].name}:</Typography>
          <Typography variant="body1">Total Income: ${totalIncome}</Typography>
          <Typography variant="body1">Total Expenses: ${totalExpenses}</Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default MonthlyStatement;
