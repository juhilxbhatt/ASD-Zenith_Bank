import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel,
} from '@mui/material';

const ViewScheduledPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [payees, setPayees] = useState([]);
  const [error, setError] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState(new Set());

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

    const fetchPayees = async () => {
      try {
        const response = await fetch('/api/payees?userId=$userId'); // Adjust userId as needed
        if (!response.ok) {
          throw new Error('Failed to fetch payees');
        }
        const data = await response.json();
        setPayees(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPayments();
    fetchPayees();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleAnother = () => {
    navigate('/Schedule-Payment');
  };

  const handleEditPayment = (payment) => {
    setEditingSchedule(payment._id);
    setFormData({
      amount: payment.amount,
      payee: payment.payee, // Payee ID
      payment_type: payment.payment_type,
      selected_date: payment.selected_date,
      recurrence: payment.recurrence,
      end_date: payment.end_date,
      is_indefinite: payment.is_indefinite,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdatePayment = async () => {
    try {
      const selectedPayee = payees.find(payee => payee._id === formData.payee);
      const payeeName = selectedPayee ? `${selectedPayee.first_name} ${selectedPayee.last_name}` : '';

      const response = await fetch(`/api/edit_payment/${editingSchedule}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, payee: payeeName }), // Save payee name instead of ID
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      const updatedPayments = payments.map((payment) => 
        payment._id === editingSchedule ? { ...payment, ...formData, payee: payeeName } : payment
      );
      setPayments(updatedPayments);
      handleDialogClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSelectedPayments = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete selected payments?');
    if (!confirmDelete) return;

    try {
      for (const paymentId of selectedPayments) {
        const response = await fetch(`/api/delete_payment/${paymentId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to delete payment');
        }
      }

      // Update the payments state to remove the deleted payments
      setPayments((prevPayments) => prevPayments.filter((payment) => !selectedPayments.has(payment._id)));
      setSelectedPayments(new Set()); // Clear selection
    } catch (error) {
      setError(error.message);
    }
  };

  const togglePaymentSelection = (paymentId) => {
    setSelectedPayments((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(paymentId)) {
        newSelected.delete(paymentId); // Deselect if already selected
      } else {
        newSelected.add(paymentId); // Select if not already selected
      }
      return newSelected;
    });
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        minHeight: '100vh',
        py: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
                    <TableRow
                      key={payment._id}
                      onClick={() => togglePaymentSelection(payment._id)} // Toggle selection on row click
                      sx={{
                        backgroundColor: selectedPayments.has(payment._id) ? '#e0f7fa' : 'inherit', // Change color if selected
                        cursor: 'pointer',
                      }}
                    >
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
                          color="primary"
                          onClick={() => handleEditPayment(payment)}
                          sx={{ ml: 1 }}
                        >
                          Edit
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
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDeleteSelectedPayments} // Delete selected payments
              disabled={selectedPayments.size === 0} // Disable if no payments are selected
            >
              Delete Selected Payments
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog for Editing Payment */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            name="amount"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.amount || ''}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payee</InputLabel>
            <Select
              name="payee"
              value={formData.payee || ''}
              onChange={handleInputChange}
              required
            >
              {payees.map((payee) => (
                <MenuItem key={payee._id} value={payee._id}>
                  {`${payee.first_name} ${payee.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Payment Type"
            name="payment_type"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.payment_type || ''}
            onChange={handleInputChange}
            required
          />
          <TextField
            name="selected_date"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.selected_date ? new Date(formData.selected_date).toISOString().split('T')[0] : ''}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Recurrence"
            name="recurrence"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.recurrence || ''}
            onChange={handleInputChange}
            required
          />
          <TextField
            name="end_date"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="is_indefinite"
                checked={formData.is_indefinite || false}
                onChange={(e) => setFormData((prevData) => ({ ...prevData, is_indefinite: e.target.checked }))}
              />
            }
            label="Indefinite"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdatePayment} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewScheduledPayments;
