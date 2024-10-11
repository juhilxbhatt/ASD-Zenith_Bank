import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Button, Grid, Box, Typography, Card, CardContent, CardActions, Container } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PaymentIcon from '@mui/icons-material/Payment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ViewListIcon from '@mui/icons-material/ViewList';
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
  const { user, logout } = useAuth(); // Access user and logout function from Auth context

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 10,
      }}
    >
      <Container maxWidth="lg">
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

        {/* User Greeting and Logout */}
        {user.isAuthenticated && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" color="inherit">
              Hello, {user.first_name} {user.last_name}
            </Typography>
            <Button
              onClick={logout}
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
          </Box>
        )}

        {/* Cards Grid */}
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
                  Add new payees for easy payments.
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

          {/* Schedule Payment */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
              <CardContent>
                <ScheduleIcon fontSize="large" sx={{ color: '#673ab7' }} />
                <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                  Schedule Payment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Schedule payments to your payees easily.
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
                    Schedule Payment
                  </Button>
                </Link>
              </CardActions>
            </StyledCard>
          </Grid>

          {/* View Payees */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
              <CardContent>
                <ViewListIcon fontSize="large" sx={{ color: '#795548' }} />
                <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                  View Payees
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  See your list of payees.
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

          {/* View Scheduled Payments */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard sx={{ textAlign: 'center', borderRadius: '15px', boxShadow: 4 }}>
              <CardContent>
                <ScheduleIcon fontSize="large" sx={{ color: '#607d8b' }} />
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
                    View Scheduled Payments
                  </Button>
                </Link>
              </CardActions>
            </StyledCard>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}

export default Home;