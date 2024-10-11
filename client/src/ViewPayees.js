import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Cookies from 'js-cookie';


const ViewPayee = () => {
    const navigate = useNavigate(); // Initialize useNavigate hook
    const [payees, setPayees] = useState([]);
    const [selectedPayees, setSelectedPayees] = useState(new Set());
    const [error, setError] = useState('');
    const [editingPayee, setEditingPayee] = useState(null); // State to hold the payee currently being edited
    const [formData, setFormData] = useState({}); // State for form data for editing
    const [searchQuery, setSearchQuery] = useState(''); // State for the search query

    useEffect(() => {
        fetchPayees();
    }, []);

    const fetchPayees = async () => {
            const response = await fetch('/api/payees?userId=$userId');
            const data = await response.json();
            setPayees(data);
    };

    const handleCheckboxChange = (payeeId) => {
        setSelectedPayees((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(payeeId)) {
                newSelected.delete(payeeId); // Unselect payee if already selected
            } else {
                newSelected.add(payeeId); // Select payee
            }
            return newSelected;
        });
    };

    const handleDeleteSelected = async () => {
        try {
            const response = await fetch('/api/delete_payees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedPayees) }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete payees');
            }
            setPayees((prevPayees) => prevPayees.filter(payee => !selectedPayees.has(payee._id)));
            // Refresh the payees list after deletion
            fetchPayees();
            setSelectedPayees(new Set()); // Reset selected payees
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditClick = (payee) => {
        setEditingPayee(payee); // Set the payee to be edited
        setFormData({
            firstName: payee.first_name,
            lastName: payee.last_name,
            bankName: payee.bank_name,
            accountNumber: payee.account_number,
            accountBSB: payee.account_bsb,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePayee = async (e) => {
        e.preventDefault();
        if (!editingPayee) return;

        try {
            const response = await fetch(`/api/edit_payee/${editingPayee._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update payee');
            }

            // Reload the payees after a successful update
            fetchPayees();
            setEditingPayee(null); // Clear editing state
            setFormData({}); // Clear form data
        } catch (error) {
            setError(error.message);
        }
    };
    const handleBack = () => {//Goes to the page before
        navigate(-1);
      };

    // Filter payees based on the search query
    const filteredPayees = payees.filter((payee) =>
        `${payee.first_name} ${payee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <h1>Payees</h1>
            {error && <p className="error">{error}</p>}
            <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Bank Name</th>
                        <th>Account Number</th>
                        <th>Account BSB</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPayees.length === 0 ? (
                        <tr>
                            <td colSpan="7">No payees found</td>
                        </tr>
                    ) : (
                        filteredPayees.map((payee) => (
                            <tr key={payee._id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedPayees.has(payee._id)}
                                        onChange={() => handleCheckboxChange(payee._id)}
                                    />
                                </td>
                                <td>{payee.first_name}</td>
                                <td>{payee.last_name}</td>
                                <td>{payee.bank_name}</td>
                                <td>{payee.account_number}</td>
                                <td>{payee.account_bsb}</td>
                                <td>
                                    <button onClick={() => handleEditClick(payee)}>Edit</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {editingPayee && (
                <div>
                    <h2>Edit Payee</h2>
                    <form onSubmit={handleUpdatePayee}>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName || ''}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName || ''}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="bankName"
                            placeholder="Bank Name"
                            value={formData.bankName || ''}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Account Number"
                            value={formData.accountNumber || ''}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="accountBSB"
                            placeholder="Account BSB"
                            value={formData.accountBSB || ''}
                            onChange={handleInputChange}
                            required
                        />
                        <button type="submit">Update Payee</button>
                        <button type="button" onClick={() => setEditingPayee(null)}>Cancel</button>
                    </form>
                </div>
            )}
            <button onClick={handleDeleteSelected} disabled={selectedPayees.size === 0}>Delete Payees</button>
            <button type="button" onClick={handleBack}>Back</button>
        </div>
    );
};

export default ViewPayee;
