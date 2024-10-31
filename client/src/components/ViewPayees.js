import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

const ViewPayee = () => {
    const navigate = useNavigate();
    const [payees, setPayees] = useState([]);
    const [selectedPayees, setSelectedPayees] = useState(new Set());
    const [error, setError] = useState('');
    const [editingPayee, setEditingPayee] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetchPayees();
    }, []);

    const fetchPayees = async () => {
        const response = await fetch('/api/payees?userId=$userId');
        const data = await response.json();
        setPayees(data);
    };

    const handleRowClick = (payeeId) => {
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
    //handles deletion from database
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
            setSelectedPayees(new Set());
        } catch (error) {
            setError(error.message);
        }
    };
    //handles edit button
    const handleEditClick = (payee) => {
        setEditingPayee(payee);
        setFormData({
            firstName: payee.first_name,
            lastName: payee.last_name,
            bankName: payee.bank_name,
            accountNumber: payee.account_number,
            accountBSB: payee.account_bsb,
        });
        setDialogOpen(true);
    };
    //effects change as its happening
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    //handles the update button
    const handleUpdatePayee = async () => {
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
            setDialogOpen(false);
            setEditingPayee(null);
            setFormData({});
        } catch (error) {
            setError(error.message);
        }
    };
// handles back functionilty
    const handleBack = () => {
        navigate('/');
    };

    const filteredPayees = payees.filter((payee) =>
        `${payee.first_name} ${payee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (

        //contains the table design and the dialog for editing
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
                <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
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
                                        <TableCell colSpan={6} align="center">
                                            No payees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayees.map((payee) => (
                                        <TableRow 
                                            key={payee._id}
                                            onClick={() => handleRowClick(payee._id)}
                                            style={{ cursor: 'pointer', backgroundColor: selectedPayees.has(payee._id) ? '#f0f0f0' : 'transparent' }}
                                        >
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
                </Paper>

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

            {/* popup box for Editing Payee */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Edit Payee</DialogTitle>
                <DialogContent>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdatePayee} color="primary">
                        Update Payee
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ViewPayee;