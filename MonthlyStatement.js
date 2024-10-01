import React, { useState } from 'react';
import { Button, Box, Container, Typography, MenuItem, Select, InputLabel, FormControl, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Mock data for transactions
const allTransactions = [
  { type: 'deposit', amount: 100, category: 'Savings', date: '2023-01-15' },
  { type: 'withdrawal', amount: 50, category: 'Groceries', date: '2023-02-05' },
  { type: 'deposit', amount: 200, category: 'Salary', date: '2023-02-20' },
  { type: 'withdrawal', amount: 75, category: 'Entertainment', date: '2023-03-10' },
];

function MonthlyStatement() {
  const [transactions, setTransactions] = useState(allTransactions);
  const [sortBy, setSortBy] = useState('');
  const navigate = useNavigate();

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);

    const sortedTransactions = [...transactions].sort((a, b) => {
      if (value === 'date') {
        return new Date(a.date) - new Date(b.date);
      }
      if (value === 'amount') {
        return a.amount - b.amount;
      }
      return 0;
    });

    setTransactions(sortedTransactions);
  };

  // Line chart data for visualization
  const chartData = {
    labels: transactions.map((txn) => txn.date),
    datasets: [
      {
        label: 'Amount',
        data: transactions.map((txn) => txn.amount),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
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

      {/* Sort Options */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Sort By</InputLabel>
        <Select value={sortBy} onChange={handleSortChange}>
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="amount">Amount</MenuItem>
        </Select>
      </FormControl>

      {/* Display Transaction Data */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Transactions:</Typography>
        <ul>
          {transactions.map((txn, index) => (
            <li key={index}>
              {txn.type} - ${txn.amount} on {txn.date}
            </li>
          ))}
        </ul>
      </Paper>

      {/* Display Total Deposits and Withdrawals */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">
          Total Deposits: $
          {transactions.filter((txn) => txn.type === 'deposit').reduce((acc, txn) => acc + txn.amount, 0)}
        </Typography>
        <Typography variant="h6">
          Total Withdrawals: $
          {transactions.filter((txn) => txn.type === 'withdrawal').reduce((acc, txn) => acc + txn.amount, 0)}
        </Typography>
      </Box>

      {/* Data Visualization - Line Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Overview:
        </Typography>
        <Line data={chartData} />
      </Box>
    </Container>
  );
}

export default MonthlyStatement;
