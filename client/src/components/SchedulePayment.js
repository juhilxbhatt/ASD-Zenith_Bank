import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Alert, Grid, Paper } from '@mui/material';

function SchedulePayment() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState("");
    const [paymentType, setPaymentType] = useState("one-off");
    const [recurrence, setRecurrence] = useState("No");
    const [endDate, setEndDate] = useState("");
    const [amount, setAmount] = useState("");
    const [payee, setPayee] = useState("");
    const [payees, setPayees] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchPayees = async () => {
            try {
                const response = await axios.get('/api/payees');
                setPayees(response.data);
            } catch (error) {
                console.error("Error fetching payees:", error);
            }
        };
        fetchPayees();
    }, []);

    const handlePaymentTypeChange = (e) => {
        const type = e.target.value;
        setPaymentType(type);
        
        // Adjust recurrence and endDate based on payment type
        if (type === "one-off") {
            setRecurrence("No");
            setEndDate(""); 
        } else {
            setRecurrence("weekly");
        }
    };

    const handleRecurrenceChange = (e) => {
        setRecurrence(e.target.value);

        if (selectedDate) {
            const newEndDate = new Date(selectedDate);

            if (e.target.value === "weekly") {
                newEndDate.setDate(newEndDate.getDate() + 7);
            } else if (e.target.value === "monthly") {
                newEndDate.setMonth(newEndDate.getMonth() + 1);
            }

            setEndDate(newEndDate.toISOString().split('T')[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be a number greater than 0");
            return;
        }

        if (paymentType === "recurring" && !endDate) {
            setError("Please select an end date for recurring payments.");
            return;
        }

        if (!selectedDate) {
            setError("Please select a payment date.");
            return;
        }

        const paymentData = {
            amount,
            payee,
            paymentType,
            selectedDate,
            recurrence,
            endDate: endDate || null,
        };

        setError("");
        try {
            await axios.post('/api/schedule_payment', paymentData);
            setSuccessMessage("Payment successfully scheduled!");

            // Clear form fields
            setAmount(""); 
            setPayee(""); 
            setSelectedDate("");
            setEndDate("");
            setRecurrence("No");
            setPaymentType("one-off");

            navigate('/view-scheduled-payments');
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred while scheduling the payment.");
        }
    };

    return (
        <Box sx={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', minHeight: '100vh', py: 10 }}>
            <Container maxWidth="sm">
                <Paper elevation={4} sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Schedule Payment
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    type="number"
                                    fullWidth
                                    required
                                    InputProps={{ startAdornment: <Typography variant="body2" sx={{ pr: 1 }}>$</Typography> }}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Transfer To</InputLabel>
                                    <Select value={payee} onChange={(e) => setPayee(e.target.value)} required>
                                        <MenuItem value="">Select Payee</MenuItem>
                                        {payees.map((payee) => (
                                            <MenuItem key={payee._id} value={payee.first_name + ' ' + payee.last_name}>
                                                {payee.first_name} {payee.last_name} - {payee.bank_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Payment Type</InputLabel>
                                    <Select value={paymentType} onChange={handlePaymentTypeChange}>
                                        <MenuItem value="one-off">One-Off Payment</MenuItem>
                                        <MenuItem value="recurring">Recurring Payment</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Select Payment Date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                />
                            </Grid>

                            {paymentType === "recurring" && (
                                <>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Recurrence</InputLabel>
                                            <Select value={recurrence} onChange={handleRecurrenceChange}>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="End Date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={6}>
                                <Button variant="outlined" fullWidth onClick={() => navigate('/')}>
                                    Back
                                </Button>
                            </Grid>

                            <Grid item xs={6}>
                                <Button variant="contained" type="submit" fullWidth>
                                    Schedule Payment
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

export default SchedulePayment;