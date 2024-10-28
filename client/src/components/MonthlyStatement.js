import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

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

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthlyStatement() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get(`/api/user/transactions`, {
        params: { month },
        withCredentials: true,
      });
      setTransactions(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred while fetching transactions.');
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth);
  }, [selectedMonth]);

  const totalIncome = transactions.filter((txn) => txn.type === 'deposit').reduce((acc, txn) => acc + txn.amount, 0);
  const totalExpenses = transactions.filter((txn) => txn.type === 'withdrawal').reduce((acc, txn) => acc + txn.amount, 0);

  const lineChartData = {
    labels: transactions.map((txn) => txn.date),
    datasets: [
      {
        label: 'Income',
        data: transactions.filter((txn) => txn.type === 'deposit').map((txn) => txn.amount),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: transactions.filter((txn) => txn.type === 'withdrawal').map((txn) => txn.amount),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: [...new Set(transactions.map((txn) => txn.category))],
    datasets: [
      {
        data: transactions.map((txn) => txn.amount),
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  return (
    <Box sx={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
          Monthly Bank Statement
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            color: '#fff',
            borderColor: '#fff',
            '&:hover': { backgroundColor: '#fff', color: '#2193b0' },
          }}
        >
          Go Back
        </Button>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: '#fff' }}>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
              '& .MuiSvgIcon-root': { color: '#fff' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
            }}
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 4, color: '#fff' }}>
          <Typography variant="h6">Summary for {selectedMonth}:</Typography>
          <Typography variant="body1">Total Income: ${totalIncome}</Typography>
          <Typography variant="body1">Total Expenses: ${totalExpenses}</Typography>
        </Box>

        <Divider sx={{ my: 3, backgroundColor: '#fff' }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Income vs Expenses</Typography>
              <Line data={lineChartData} />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Transaction Breakdown by Category</Typography>
              <Pie data={pieChartData} />
            </StyledPaper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, backgroundColor: '#fff' }} />

        <StyledPaper>
          <Typography variant="h6" gutterBottom>Detailed Transactions:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {transactions.map((txn, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{txn.date} - {txn.category} - {txn.type === 'deposit' ? 'Income' : 'Expense'}</Typography>
                <Typography variant="body2" color={txn.type === 'deposit' ? 'primary' : 'secondary'}>${txn.amount}</Typography>
              </Box>
            ))}
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
}

export default MonthlyStatement;
