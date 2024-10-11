import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Checkbox 
} from '@mui/material';

const ViewPayee = () => {
    const navigate = useNavigate();
    const [payees, setPayees] = useState([]);
    const [selectedPayees, setSelectedPayees] = useState(new Set());
    const [error, setError] = useState('');
    const [editingPayee, setEditingPayee] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

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
                newSelected.delete(payeeId);
            } else {
                newSelected.add(payeeId);
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
            fetchPayees();
            setSelectedPayees(new Set());
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditClick = (payee) => {
        setEditingPayee(payee);
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

            fetchPayees();
            setEditingPayee(null);
            setFormData({});
        } catch (error) {
            setError(error.message);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const filteredPayees = payees.filter((payee) =>
        `${payee.first_name} ${payee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <Container maxWidth="md" sx={{ backgroundColor: '#fff', p: 4, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Payees
                </Typography>
                
                {error && <Typography color="error">{error}</Typography>}

                <TextField
                    label="Search by name..."
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Select</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Bank Name</TableCell>
                                <TableCell>Account Number</TableCell>
                                <TableCell>Account BSB</TableCell>
                                <TableCell>Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPayees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No payees found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayees.map((payee) => (
                                    <TableRow key={payee._id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedPayees.has(payee._id)}
                                                onChange={() => handleCheckboxChange(payee._id)}
                                            />
                                        </TableCell>
                                        <TableCell>{payee.first_name}</TableCell>
                                        <TableCell>{payee.last_name}</TableCell>
                                        <TableCell>{payee.bank_name}</TableCell>
                                        <TableCell>{payee.account_number}</TableCell>
                                        <TableCell>{payee.account_bsb}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleEditClick(payee)}
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

                {editingPayee && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Edit Payee
                        </Typography>
                        <form onSubmit={handleUpdatePayee}>
                            <TextField
                                label="First Name"
                                name="firstName"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={formData.firstName || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={formData.lastName || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                label="Bank Name"
                                name="bankName"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={formData.bankName || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                label="Account Number"
                                name="accountNumber"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={formData.accountNumber || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                label="Account BSB"
                                name="accountBSB"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={formData.accountBSB || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button type="submit" variant="contained" color="success">
                                    Update Payee
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => setEditingPayee(null)}>
                                    Cancel
                                </Button>
                            </Box>
                        </form>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteSelected}
                        disabled={selectedPayees.size === 0}
                    >
                        Delete Payees
                    </Button>
                    <Button variant="outlined" onClick={handleBack}>
                        Back
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default ViewPayee;