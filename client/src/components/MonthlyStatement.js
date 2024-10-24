import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider, Alert } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

// Import necessary components from Chart.js
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

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// Custom Card Styling
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

// Mock months (can be fetched dynamically)
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthlyStatement({ userId }) {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // Add error state to handle error message
  const navigate = useNavigate();

  // Fetch transactions from MongoDB via Flask backend
  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get(`/api/user/transactions`, {
        params: { month },
      });
      setTransactions(response.data);
    } catch (error) {
      if (error.response && error.response.data.error) {
        // If error message exists, set it to display
        setErrorMessage(error.response.data.error);
      } else {
        console.error('Error fetching transactions', error);
      }
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth); // Fetch transactions when the month changes
  }, [selectedMonth]);

  if (errorMessage) {
    // Display the error message in red text
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" gutterBottom color="error">
          {errorMessage}
        </Typography>
      </Container>
    );
  }

  // If no error, render the monthly statement content
  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 10,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
          Monthly Bank Statement
        </Typography>

        {/* Go Back Button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            color: '#fff',
            borderColor: '#fff',
            '&:hover': {
              backgroundColor: '#fff',
              color: '#2193b0',
            },
          }}
        >
          Go Back
        </Button>

        {/* Month Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: '#fff' }}>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
              },
              '& .MuiSvgIcon-root': {
                color: '#fff',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
              },
            }}
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Transaction Summary */}
        <Box sx={{ mb: 4, color: '#fff' }}>
          <Typography variant="h6">Summary for {selectedMonth}:</Typography>
          <Typography variant="body1">Total Income: ${totalIncome}</Typography>
          <Typography variant="body1">Total Expenses: ${totalExpenses}</Typography>
        </Box>

        <Divider sx={{ my: 3, backgroundColor: '#fff' }} />

        {/* Charts Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Income vs Expenses
              </Typography>
              <Line data={lineChartData} />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Transaction Breakdown by Category
              </Typography>
              <Pie data={pieChartData} />
            </StyledPaper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, backgroundColor: '#fff' }} />

        {/* Transaction Table */}
        <StyledPaper>
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
        </StyledPaper>
      </Container>
    </Box>
  );
}

export default MonthlyStatement;
