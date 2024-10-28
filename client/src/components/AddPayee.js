import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Container, Typography, Grid, Paper } from '@mui/material';

function AddPayee() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBSB, setAccountBSB] = useState('');
  const [error, setError] = useState('');

  // Creates the newPayee
  const newPayee = async (e) => {
    e.preventDefault();
    
    const newPayee = {
      firstName,
      lastName,
      bankName,
      accountNumber,
      accountBSB,
    };

    try {
      const response = await axios.post('/api/new_payee', newPayee);
      if (response.status === 200) {
        alert('Payee successfully added!');
        navigate(-1);
      }
    } catch (error) {
      console.error('Invalid information entered', error);
      setError('Error adding payee. Please try again.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Add New Payee
          </Typography>

          {error && (
            <Typography variant="body1" color="error" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={newPayee}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  type="number"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Account BSB"
                  value={accountBSB}
                  onChange={(e) => setAccountBSB(e.target.value)}
                  type="number"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" type="submit" color="success">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default AddPayee;