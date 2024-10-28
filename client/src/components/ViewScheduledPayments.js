import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Grid,
} from '@mui/material';

const ViewScheduledPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/scheduled_payments');
        if (!response.ok) {
          throw new Error('Failed to fetch scheduled payments');
        }
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPayments();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleAnother = () => {
    navigate('/Schedule-Payment');
  };

  const handleDeletePayment = async (paymentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this payment?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/delete_payment/${paymentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }
      setPayments((prevPayments) => prevPayments.filter((payment) => payment._id !== paymentId));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
    sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }}
    >
        <Box sx={{ py: 5, px: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
            Scheduled Payments
        </Typography>

        {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payee</TableCell>
                    <TableCell>Payment Type</TableCell>
                    <TableCell>Selected Date</TableCell>
                    <TableCell>Recurrence</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Indefinite</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {payments.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={8} align="center">
                        No scheduled payments found
                    </TableCell>
                    </TableRow>
                ) : (
                    payments.map((payment) => (
                    <TableRow key={payment._id}>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.payee}</TableCell>
                        <TableCell>{payment.payment_type}</TableCell>
                        <TableCell>{new Date(payment.selected_date).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.recurrence || 'N/A'}</TableCell>
                        <TableCell>
                        {payment.end_date ? new Date(payment.end_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{payment.is_indefinite ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDeletePayment(payment._id)}
                        >
                            Delete
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </TableContainer>
        </Paper>

        <Grid container spacing={2} justifyContent="center">
            <Grid item>
            <Button variant="outlined" onClick={handleBack}>
                Back
            </Button>
            </Grid>
            <Grid item>
            <Button variant="contained" onClick={handleAnother}>
                Schedule Another Payment
            </Button>
            </Grid>
        </Grid>
        </Box>
    </Box>
  );
};

export default ViewScheduledPayments;