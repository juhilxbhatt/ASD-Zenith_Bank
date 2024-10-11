import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Container, Typography, Card, CardContent, CardActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

// Customizing the card styles
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '15px',
  boxShadow: theme.shadows[4],
}));

function CreateAccount() {
  const [accountType, setAccountType] = useState('');
  const [balance, setBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const createAccount = async (e) => {
    e.preventDefault();

    if (isNaN(balance)) {
      setErrorMessage('Please enter a valid number for the balance.');
      return;
    }

    const newAccount = {
      accountType,
      balance,
    };

    try {
      const response = await axios.post('/api/create_account', newAccount);
      if (response.status === 200) {
        alert('Account created successfully!');
        setAccountType('');
        setBalance('');
        setErrorMessage('');
      }
    } catch (error) {
      console.error('There was an error creating the account!', error);
    }
  };

  // Handle balance input
  const handleBalanceChange = (e) => {
    const value = e.target.value;

    // Check if the value contains only digits or is empty
    if (/^\d*$/.test(value)) {
      setBalance(value);
      setErrorMessage('');
    } else {
      setErrorMessage('Please Enter A Number');
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 10,
      }}
    >
      <Container maxWidth="sm">
        <StyledCard>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Create New Account
            </Typography>
            <form onSubmit={createAccount}>
              <div>
                <FormControl fullWidth required sx={{ mb: 3 }}>
                  <InputLabel id="account-type-label">Account Type</InputLabel>
                  <Select
                    labelId="account-type-label"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    displayEmpty
                    sx={{
                      '& .MuiSelect-select': {
                        padding: '12px 14px', // Adjust padding as needed
                        textAlign: 'center',   // Center the text
                      },
                      '& .MuiSelect-icon': {
                        right: '12px',         // Adjust icon position
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      
                    </MenuItem>
                    <MenuItem value="Debit">Debit</MenuItem>
                    <MenuItem value="Saving">Saving</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div>
                <TextField
                  type="text"
                  label="Balance"
                  value={balance}
                  onChange={handleBalanceChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </div>
              {errorMessage && (
                <Typography variant="body2" sx={{ color: 'red', mb: 2 }}>
                  {errorMessage}
                </Typography>
              )}
              <CardActions>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 2 }}>
                  Create Account
                </Button>
              </CardActions>
            </form>
            {/* Button to go to Home */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/" style={{ textDecoration: 'none', width: '100%' }}>
                <Button variant="outlined" color="primary" fullWidth sx={{ py: 2 }}>
                  Go to Home
                </Button>
              </Link>
            </Box>
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
}

export default CreateAccount;