import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Divider } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthlyStatement() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  // Fetch transactions from MongoDB via Flask backend
  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get('/api/user/transactions', { params: { month } });
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    const monthIndex = months.indexOf(selectedMonth) + 1;  // Convert month name to number
    fetchTransactions(monthIndex);  // Fetch transactions when the month changes
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

  return (
    <Box>
      {/* UI layout remains the same */}
      {/* The dynamically fetched transactions are now rendered in the charts */}
    </Box>
  );
}

export default MonthlyStatement;
