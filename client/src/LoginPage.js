import React, { useState } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { styled } from '@mui/system';
import Cookies from 'js-cookie';

// Customizing the button hover effect
const StyledButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transition: 'background-color 0.3s ease',
  },
}));

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/LoginPage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess('Login successful! Redirecting...');
                setError('');

                // Store the user ID in a cookie (expires in 7 days)
                Cookies.set('user_id', result.user.id, { expires: 0.1 });

                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/Home';  // Redirect to your home page
                }, 2000);
            } else {
                if (result.error) {
                    setError(result.error);
                } else {
                    setError('Invalid credentials, please try again.');
                }
                setSuccess('');
            }
        } catch (error) {
            setError('Something went wrong, please try again.');
            setSuccess('');
        }
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 5,
            }}
        >
            <Container maxWidth="sm">
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{ color: '#fff', fontWeight: 'bold' }}
                >
                    Welcome Back to Zenith Bank
                </Typography>
                <Typography
                    variant="h6"
                    align="center"
                    sx={{ color: '#f0f0f0', mb: 4 }}
                >
                    Please log in to your account
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        backgroundColor: 'white',
                        padding: 4,
                        borderRadius: '8px',
                        boxShadow: 3,
                    }}
                >
                    <Box sx={{ mb: 2 }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Box>
                    <StyledButton
                        variant="contained"
                        color="primary"
                        fullWidth
                        type="submit"
                        sx={{ py: 2 }}
                    >
                        Login
                    </StyledButton>

                    {error && <Typography color="error" align="center" sx={{ mt: 2 }}>{error}</Typography>}
                    {success && <Typography color="success" align="center" sx={{ mt: 2 }}>{success}</Typography>}

                    <Typography
                        align="center"
                        sx={{ mt: 2, color: '#1976d2', cursor: 'pointer' }}
                        onClick={() => window.location.href = '/create-user'}
                    >
                        Don't have an account? Register here!
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default LoginPage;