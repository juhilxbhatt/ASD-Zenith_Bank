import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Button, Grid, Box, Typography, Card, CardContent, CardActions, Container } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PaymentIcon from '@mui/icons-material/Payment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Icon for View Payees
import { styled } from '@mui/system';

// Customizing the card hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'scale(1.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
}));

function Home() {
  const navigate = useNavigate(); // Create a navigate function
  const { user, logout } = useAuth(); // Access user and logout function from Auth context

  const handleLogout = () => {
    logout(); // Call the logout function
    navigate('/login-page'); // Redirect to the login page
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 10,
      }}
    >
      <Container maxWidth="lg">
        {/* User Greeting and Logout */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          {user.isAuthenticated ? (
            <>
              <Typography variant="h5" color="inherit">
                Welcome back!
              </Typography>
              <Button
                onClick={handleLogout} // Use the new handleLogout function
                variant="contained"
                color="error"
                sx={{
                  py: 1,
                  px: 3,
                  borderRadius: '5px',
                  transition: 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#ff6666',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              sx={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                borderRadius: '5px',
              }}
              onClick={() => navigate('/login-page')} // Redirect to login page
            >
              Login
            </Button>
          )}
        </Box>

        {/* Hero Section */}
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}
        >
          Welcome to Zenith Bank
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ color: '#f0f0f0', mb: 6 }}
        >
          Your trusted financial partner. Explore our services below.
        </Typography>

        {/* Check if user is authenticated */}
        {user.isAuthenticated ? (
          // Cards Grid
          <Grid container spacing={4}>
            {/* Create Account */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <AccountCircleIcon fontSize="large" sx={{ color: '#1976d2' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Create Account
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Start your journey with us. Open an account in minutes.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/create-account" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      Create Account
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Transaction Logs */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <ListAltIcon fontSize="large" sx={{ color: '#ff5722' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Transaction Logs
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Access detailed logs of your recent transactions.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/transactionLogs" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      View Logs
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Monthly Statement */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <ReceiptIcon fontSize="large" sx={{ color: '#009688' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Monthly Statement
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Get insights into your spending and earnings.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/monthly-statement" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="info"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      View Statement
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Bank Statement */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <ReceiptIcon fontSize="large" sx={{ color: '#673ab7' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Bank Statement
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Download your custom bank statements.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/BankStatement" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      View Statements
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Transfer & Deposit */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <SwapHorizIcon fontSize="large" sx={{ color: '#4caf50' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Transfer & Deposit
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manage your funds with quick transfers and deposits.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/transfer-deposit" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      Transfer & Deposit
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Add Payee */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <PaymentIcon fontSize="large" sx={{ color: '#ff9800' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Add Payee
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Add and manage payees for easy transfers.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/add-payee" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="warning"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      Add Payee
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* View Payees */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <PersonAddIcon fontSize="large" sx={{ color: '#3f51b5' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    View Payees
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manage your existing payees for transfers.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/view-payees" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      View Payees
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Scheduled Transactions */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <ScheduleIcon fontSize="large" sx={{ color: '#e91e63' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Schedule Payment
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Schedule payments to your payees with ease.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/schedule-payment" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      View Scheduled
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>

            {/* Transaction History */}
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
                <CardContent>
                  <ViewListIcon fontSize="large" sx={{ color: '#9c27b0' }} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Scheduled Payments
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    View your scheduled payments.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to="/view-scheduled-payments" style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="info"
                      fullWidth
                      sx={{ borderRadius: '0 0 15px 15px', py: 2 }}
                    >
                      View History
                    </Button>
                  </Link>
                </CardActions>
              </StyledCard>
            </Grid>
          </Grid>
        ) : (
          <Typography
            variant="h5"
            align="center"
            sx={{ color: '#fff', mt: 5 }}
          >
            Please sign in or create an account to access our services.
          </Typography>
        )}
      </Container>
    </Box>
  );
}

export default Home;
