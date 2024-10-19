import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Container, Card, CardContent, CardActions, Grid, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

// Custom Card for Transaction Log Item
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: '20px',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'scale(1.02)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
}));

function TransactionLogs() {
  const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]); // State to hold accounts
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  useEffect(() => {
    // Fetch transaction logs from the backend
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/transaction_logs');
        console.log("Response from API:", response.data); // Log the response

        // Check if TransactionLogs exists in the response data
        if (response.data.TransactionLogs) {
          const logs = response.data.TransactionLogs;

          // Group logs by AccountID
          const grouped = logs.reduce((acc, log) => {
            const accountId = log.AccountID;
            if (!acc[accountId]) acc[accountId] = [];
            acc[accountId].push(log);
            return acc;
          }, {});
          setGroupedLogs(grouped); // Set the grouped logs
        }

        // Store the accounts in state
        setAccounts(response.data.Accounts);
      } catch (error) {
        console.error('Error fetching transaction logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const handleAccountSelect = (accountId) => {
    setSelectedAccount(accountId);
  };

  // Get a list of all account IDs
  const accountIds = accounts.map(account => account._id.toString()); // Make sure to convert ObjectId to string

  // Filter the transaction logs by the search term
  const filteredLogs = selectedAccount && groupedLogs[selectedAccount]
    ? groupedLogs[selectedAccount].filter((log) =>
        log.Description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 10,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}
        >
          Transaction Logs
        </Typography>

        {/* Account selection */}
        {accountIds.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" align="center" sx={{ color: '#f0f0f0', mb: 2 }}>
              Select Account
            </Typography>
            <Grid container spacing={2}>
              {accountIds.map((accountId) => (
                <Grid item xs={12} sm={6} md={4} key={accountId}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h5" align="center">
                        Account {accountId}
                      </Typography>
                      {groupedLogs[accountId] && groupedLogs[accountId].length === 0 && (
                        <Typography variant="body2" align="center" sx={{ color: 'red' }}>
                          No transactions available
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleAccountSelect(accountId)}
                      >
                        View Transactions
                      </Button>
                    </CardActions>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography variant="body1" align="center" sx={{ color: '#f0f0f0' }}>
            No accounts available.
          </Typography>
        )}

        {/* Transaction logs for the selected account */}
        {selectedAccount && groupedLogs[selectedAccount] !== undefined ? (
          <Box>
            <Typography variant="h5" align="center" sx={{ color: '#fff', mb: 3 }}>
              Transactions for Account {selectedAccount}
            </Typography>

            {/* Search field for filtering descriptions */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3, backgroundColor: '#fff' }}
            />

            {filteredLogs.length > 0 ? (
              <Grid container spacing={2}>
                {filteredLogs.map((log, index) => (
                  <Grid item xs={12} key={index}>
                    <StyledCard>
                      <CardContent>
                        <Typography variant="body1">
                          <strong>Amount:</strong> ${log.Amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Date:</strong> {new Date(log.Date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Description:</strong> {log.Description}
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" align="center" sx={{ color: '#f0f0f0' }}>
                No transactions matching the search criteria.
              </Typography>
            )}
          </Box>
        ) : (
          selectedAccount && (
            <Typography variant="body1" align="center" sx={{ color: '#f0f0f0' }}>
              No transactions for this account.
            </Typography>
          )
        )}

        {/* Button to go to Home */}
        <Box sx={{ background: '#FFF', textAlign: 'center', mt: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', width: '100%' }}>
            <Button variant="outlined" color="primary" fullWidth sx={{ py: 2 }}>
              Go to Home
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default TransactionLogs;