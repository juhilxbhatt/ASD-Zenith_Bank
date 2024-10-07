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
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Check if the email already exists
            const checkResponse = await axios.get(`/api/check_email?email=${email}`);
            
            // If email exists, alert the user
            if (checkResponse.data.exists) {
                setMessage('Account already exists. Please use a different email.');
                return; // Exit early if the email exists
            } 
            
            // Proceed to create user since the email is available
            const newUser = {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                address,
            };
    
            const response = await axios.post('/api/create_user', newUser);
            if (response.status === 201) {
                setMessage('User created successfully!');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage('Error creating user. Please try again.');
        }
    };
    

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <div className="create-user-container">
            <h1>Create New User</h1>
            <form onSubmit={handleSubmit} className="create-user-form">
                {/* First Name - Minimum 2 characters, only letters */}
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        pattern="[A-Za-z]{2,}"
                        title="First name must be at least 2 characters long and contain only letters."
                    />
                </div>

                {/* Last Name - Minimum 2 characters, only letters */}
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        pattern="[A-Za-z]{2,}"
                        title="Last name must be at least 2 characters long and contain only letters."
                    />
                </div>

                {/* Email - Must end with .com */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\.com$"
                        title="Please enter a valid email address that ends with .com."
                    />
                </div>

                {/* Password - Minimum 8 characters, must include numbers */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            title="Password must be at least 8 characters long, and include at least one number, one uppercase, and one lowercase letter."
                        />
                        {/* Checkbox to toggle password visibility */}
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={togglePasswordVisibility}
                            />
                            Show Password
                        </label>
                    </div>
                </div>

                {/* Address - At least 5 characters */}
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        pattern=".{5,}"
                        title="Address must be at least 5 characters long."
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
