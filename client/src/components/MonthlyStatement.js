// src/components/MonthlyStatement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import { useAuth } from '../context/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login-page');
      return;
    }
    fetchTransactions(selectedMonth);
  }, [selectedMonth, isAuthenticated, navigate]);

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

  const totalIncome = transactions.filter((txn) => txn.type === 'deposit').reduce((acc, txn) => acc + txn.amount, 0);
  const totalExpenses = transactions.filter((txn) => txn.type === 'withdrawal').reduce((acc, txn) => acc + txn.amount, 0);

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
      {/* Render content */}
    </Box>
  );
}

export default MonthlyStatement;
