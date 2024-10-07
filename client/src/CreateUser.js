import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { Box, Container, Typography, TextField, Button, Alert } from '@mui/material';

function CreateUser() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newUser = {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            address,
        };

        try {
            const response = await axios.post('/api/create_user', newUser);
            if (response.status === 201) {
                setMessage('User created successfully!');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage('Error creating user. Please try again.');
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
                <Typography variant="h4" align="center" sx={{ color: '#fff', mb: 4 }}>
                    Create New User
                </Typography>
                
                <Box 
                    sx={{
                        backgroundColor: '#fff', // White background
                        borderRadius: '8px',
                        padding: '24px',
                        boxShadow: 3, // Optional: add a shadow for better separation
                    }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* First Name */}
                        <TextField
                            label="First Name"
                            variant="outlined"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            fullWidth
                        />

                        {/* Last Name */}
                        <TextField
                            label="Last Name"
                            variant="outlined"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            fullWidth
                        />

                        {/* Email */}
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />

                        {/* Password */}
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                        />

                        {/* Address */}
                        <TextField
                            label="Address"
                            variant="outlined"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ borderRadius: '8px', py: 2 }}
                        >
                            Create User
                        </Button>
                    </form>
                </Box>

                {/* Display message */}
                {message && <Alert severity={message.includes('Error') ? 'error' : 'success'}>{message}</Alert>}

                {/* Link to go back to Login Page */}
                <Typography variant="body2" align="center" sx={{ color: '#fff', mt: 2 }}>
                    Already have an account?{' '}
                    <Link to="/login-page" style={{ color: '#ffeb3b' }}>Login here</Link>
                </Typography>
            </Container>
        </Box>
    );
}

export default CreateUser;