import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginPage.css';

const LoginPage = () => {
    const { login } = useAuth();  // Access login function from context
    const navigate = useNavigate(); // Initialize useNavigate
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                login(result.userName); // Call login with the user's name
                setSuccess(`Login successful! Welcome back!`);
                setError('');
                navigate('/'); // Redirect to home
            } else {
                if (result.error) {
                    setError(result.error);
                } else if (result.message === 'Error. User not found') {
                    setError('Account not found. Please check your email.');
                } else if (result.message === 'Invalid password') {
                    setError('Invalid password. Please try again.');
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Zenith Bank</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="password"
                            />
                            <label className="show-password-label">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={togglePasswordVisibility}
                                />
                                Show Password
                            </label>
                        </div>
                    </div>
                    <button className="login-button" type="submit">Login</button>
                    <span className="register-text" onClick={() => navigate('/create-user')}>
                        Don't have an account? Register here!
                    </span>
                </form>
                <div className="message-container">
                    {error && (
                        <div className="error-container">
                            <p className="error">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="success-container">
                            <h2>Success</h2>
                            <p className="success">{success}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
