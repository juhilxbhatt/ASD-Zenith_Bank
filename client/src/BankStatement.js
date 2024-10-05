import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress, TextField } from '@mui/material';
import { Link } from 'react-router-dom';

function BankStatement() {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to fetch transaction logs
  const fetchTransactionLogs = (startDate = '', endDate = '') => {
    setLoading(true);
    let url = '/api/transaction_logs';

    // Add query parameters if startDate and endDate are provided
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
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data.");
        setLoading(false);
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