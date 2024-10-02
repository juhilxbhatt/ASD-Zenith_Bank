import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

// Mock months (can be fetched dynamically)
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthlyStatement({ userId }) {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  // Fetch transactions from MongoDB via Flask backend
  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get(`/api/user/${userId}/transactions`, {
        params: { month }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth); // Fetch transactions when the month changes
  }, [selectedMonth]);

  // Calculate totals for income and expenses
  const totalIncome = transactions.filter((txn) => txn.type === 'deposit').reduce((acc, txn) => acc + txn.amount, 0);
  const totalExpenses = transactions.filter((txn) => txn.type === 'withdrawal').reduce((acc, txn) => acc + txn.amount, 0);

  // Line chart data for monthly transaction overview
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

  // Pie chart data for transaction categories breakdown
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
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Monthly Bank Statement
      </Typography>

      {/* Go Back Button */}
      <Button variant="outlined" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Go Back
      </Button>

      {/* Month Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Month</InputLabel>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Transaction Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Summary for {selectedMonth}:</Typography>
        <Typography variant="body1">Total Income: ${totalIncome}</Typography>
        <Typography variant="body1">Total Expenses: ${totalExpenses}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Charts Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Income vs Expenses
            </Typography>
            <Line data={lineChartData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Breakdown by Category
            </Typography>
            <Pie data={pieChartData} />
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Transaction Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Transactions:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {transactions.map((txn, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {txn.date} - {txn.category} - {txn.type === 'deposit' ? 'Income' : 'Expense'}
              </Typography>
              <Typography variant="body2" color={txn.type === 'deposit' ? 'primary' : 'secondary'}>
                ${txn.amount}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}

export default MonthlyStatement;
