import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const handleBack = () => {//Goes to the page before
        navigate(-1);
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
            // Update the state to remove the deleted payment
            setPayments((prevPayments) => prevPayments.filter(payment => payment._id !== paymentId));
        } catch (error) {
            setError(error.message);
        }
    };
    return (
        <div>
            <h1>Scheduled Payments</h1>
            {error && <p className="error">{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Amount</th>
                        <th>Payee</th>
                        <th>Payment Type</th>
                        <th>Selected Date</th>
                        <th>Recurrence</th>
                        <th>End Date</th>
                        <th>Indefinite</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.length === 0 ? (
                        <tr>
                            <td colSpan="8">No scheduled payments found</td>
                        </tr>
                    ) : (
                        payments.map((payment) => (
                            <tr key={payment._id}>
                                <td>{payment.amount}</td>
                                <td>{payment.payee}</td>
                                <td>{payment.payment_type}</td>
                                <td>{new Date(payment.selected_date).toLocaleDateString()}</td>
                                <td>{payment.recurrence || 'N/A'}</td>
                                <td>{payment.end_date ? new Date(payment.end_date).toLocaleDateString() : 'N/A'}</td>
                                <td>{payment.is_indefinite ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => handleDeletePayment(payment._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <button type="button" onClick={handleBack}>Back</button>
        </div>
    );
};

export default ViewScheduledPayments;