import React, { useState } from 'react';
import './LoginPage.css';

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
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Change to your desired redirect
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
        <div>
            <nav className="navbar">
                <div className="navbar-content">
                    <button className="navbar-button" onClick={() => window.location.href = '/login'}>
                        Zenith Bank
                    </button>
                    <div className="login-inputs">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button className="login-button" onClick={handleSubmit}>Login</button>
                        <span className="register-text" onClick={() => window.location.href = '/create-user'}>
                            Don't have an account? Register here!
                        </span>
                    </div>
                </div>
            </nav>

            <div className="login-container">
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </div>
        </div>
    );
};

export default LoginPage;
