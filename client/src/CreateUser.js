import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './CreateUser.css'; // Import the CSS file for styling

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
        <div className="create-user-container">
            <h1>Create New User</h1>
            <form onSubmit={handleSubmit} className="create-user-form">
                {/* First Name */}
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>

                {/* Last Name */}
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Address */}
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <button type="submit" className="submit-btn">Create User</button>
            </form>

            {/* Display message */}
            {message && <p className="message">{message}</p>}

            {/* Link to go back to Login Page */}
            <p>
                Already have an account?{' '}
                <Link to="/login-page">Login here</Link>
            </p>
        </div>
    );
}

export default CreateUser;
