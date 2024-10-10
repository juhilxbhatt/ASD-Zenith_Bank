import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SchedulePayment() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState("");
    const [paymentType, setPaymentType] = useState("one-off");
    const [recurrence, setRecurrence] = useState("weekly");
    const [endDate, setEndDate] = useState("");
    const [amount, setAmount] = useState("");
    const [payee, setPayee] = useState("");
    const [payees, setPayees] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch payees when the component mounts
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
        setPaymentType(e.target.value);
        if (e.target.value === "one-off") {
            setEndDate("");
        }
    };

    const handleRecurrenceChange = (e) => {
        setRecurrence(e.target.value);
        if (selectedDate) {
            if (e.target.value === "weekly") {
                const newEndDate = new Date(selectedDate);
                newEndDate.setDate(newEndDate.getDate() + 7);
                setEndDate(newEndDate.toISOString().split('T')[0]);
            } else if (e.target.value === "monthly") {
                const newEndDate = new Date(selectedDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                setEndDate(newEndDate.toISOString().split('T')[0]);
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
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
            endDate: endDate || null
        };

        setError("");

        try {
            const response = await axios.post('/api/schedule_payment', paymentData);
            alert('Payment successfully Scheduled!');
            // Reset form fields after successful submission
            setAmount(""); 
            setPayee(""); 
            setSelectedDate("");
            setEndDate("");
            setRecurrence("weekly");
            setPaymentType("one-off");
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred while scheduling the payment.");
        }
    };

    return (
        <div>
            <h1>Schedule Payment</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value > 0) {
                                setAmount(e.target.value);
                                setError(""); // Reset error if valid
                            } else {
                                setAmount("");
                                setError("Positive amount needs to be entered");
                            }
                        }}
                        placeholder="$0.00"
                        className="amount-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Transfer To:</label>
                    <select
                        value={payee}
                        onChange={(e) => setPayee(e.target.value)}
                        required
                    >
                        <option value="">Select Payee</option>
                        {payees.map((payee) => (
                            <option key={payee._id} value={payee.first_name + ' ' + payee.last_name}>
                                {payee.first_name} {payee.last_name} - {payee.bank_name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Payment Type:</label>
                    <select value={paymentType} onChange={handlePaymentTypeChange}>
                        <option value="one-off">One-Off Payment</option>
                        <option value="recurring">Recurring Payment</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Select Payment Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            if (recurrence === "weekly") {
                                const newEndDate = new Date(e.target.value);
                                newEndDate.setDate(newEndDate.getDate() + 7);
                                setEndDate(newEndDate.toISOString().split('T')[0]);
                            } else if (recurrence === "monthly") {
                                const newEndDate = new Date(e.target.value);
                                newEndDate.setMonth(newEndDate.getMonth() + 1);
                                setEndDate(newEndDate.toISOString().split('T')[0]);
                            }
                        }}
                        min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                    />
                </div>

                {paymentType === "recurring" && (
                    <>
                        <div className="form-group">
                            <label>Recurrence:</label>
                            <select value={recurrence} onChange={handleRecurrenceChange}>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>End Date:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const minDate = recurrence === "weekly" 
                                            ? new Date(new Date(selectedDate).getTime() + 7 * 24 * 60 * 60 * 1000)
                                            : new Date(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth() + 1, new Date(selectedDate).getDate());

                                        if (new Date(e.target.value) >= minDate) {
                                            setEndDate(e.target.value);
                                            setError(""); // Reset error if valid
                                        } else {
                                            setError(`End date must be at least ${recurrence === "weekly" ? "a week" : "a month"} after the selected date.`);
                                        }
                                    }
                                }}
                                min={recurrence === "weekly" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            />
                        </div>
                    </>
                )}

                {error && <p className="error">{error}</p>}
                <button type="button" onClick={handleBack}>Back</button>
                <button type="submit">Schedule Payment</button>
            </form>
        </div>
    );
}

export default SchedulePayment;
