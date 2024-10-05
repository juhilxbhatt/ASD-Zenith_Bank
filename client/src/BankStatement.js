import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2'; // Import Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function BankStatement() {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data for charts
  const [monthlySpending, setMonthlySpending] = useState({});
  const [deposits, setDeposits] = useState({});
  const [withdrawals, setWithdrawals] = useState({});

  // Function to fetch transaction logs
  const fetchTransactionLogs = (startDate = '', endDate = '') => {
    setLoading(true);
    let url = '/api/transaction_logs';

    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStatementData(data);
          categorizeTransactions(data.TransactionLogs); // Categorize transactions for charts
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data.");
        setLoading(false);
      });
  };

  const categorizeTransactions = (logs) => {
    const depositsData = [];
    const withdrawalsData = [];
    const spendingData = {};

    logs.forEach((log) => {
      const logDate = new Date(log.Date);
      const month = logDate.toLocaleString('default', { month: 'long' });

      if (!spendingData[month]) {
        spendingData[month] = 0;
      }

      if (log.Amount > 0) {
        depositsData.push(log.Amount);
      } else {
        withdrawalsData.push(Math.abs(log.Amount)); // Store withdrawals as positive values
      }

      // Accumulate spending by month
      spendingData[month] += Math.abs(log.Amount);
    });

    setDeposits({
      labels: depositsData.map((_, idx) => `Transaction ${idx + 1}`),
      datasets: [
        {
          label: 'Deposits',
          data: depositsData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });

    setWithdrawals({
      labels: withdrawalsData.map((_, idx) => `Transaction ${idx + 1}`),
      datasets: [
        {
          label: 'Withdrawals',
          data: withdrawalsData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });

    setMonthlySpending({
      labels: Object.keys(spendingData),
      datasets: [
        {
          label: 'Monthly Spending',
          data: Object.values(spendingData),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Initial fetch of all transaction logs
  useEffect(() => {
    fetchTransactionLogs();
  }, []);

  // Handler for date filters
  const handleFilter = () => {
    if (startDate && endDate) {
      fetchTransactionLogs(startDate, endDate);
    } else {
      alert("Please select both start and end dates.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        minHeight: '100vh',
        py: 10,
        color: '#fff',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Bank Statement
        </Typography>

        {/* Display user and account details */}
        <Box
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            p: 3,
            boxShadow: 4,
            mb: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            User ID: {statementData.UserID}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Account ID: {statementData.AccountID}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Transaction ID: {statementData.TransactionID}
          </Typography>
        </Box>

        {/* Display transaction logs */}
        <Box
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            p: 3,
            boxShadow: 4,
            mb: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Transaction Logs
          </Typography>
                  {/* Date filter section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
          />
          <Button variant="contained" color="primary" onClick={handleFilter}>
            Filter
          </Button>
        </Box>
          {statementData.TransactionLogs.length === 0 ? (
            <Typography>No transaction logs found.</Typography>
          ) : (
            <ul>
              {statementData.TransactionLogs.map((log, index) => (
                <li key={index}>
                  <Typography variant="body1">
                    Amount: ${log.Amount.toFixed(2)} <br />
                    Date: {new Date(log.Date).toLocaleDateString()} <br />
                    Description: {log.Description}
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </Box>

        {/* Charts for deposits, withdrawals, and monthly spending */}
        <Box
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            p: 3,
            boxShadow: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Deposits
          </Typography>
          <Bar data={deposits} options={{ responsive: true }} />

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Withdrawals
          </Typography>
          <Bar data={withdrawals} options={{ responsive: true }} />

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Monthly Spending
          </Typography>
          <Line data={monthlySpending} options={{ responsive: true }} />
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" size="large">
              Back to Home
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default BankStatement;