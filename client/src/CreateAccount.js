import React, { useState } from 'react';
import axios from 'axios';

function CreateAccount() {
  const [accountType, setAccountType] = useState('');
  const [balance, setBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State to store the error message

  const createAccount = async (e) => {
    e.preventDefault();
    
    if (isNaN(balance)) {
      setErrorMessage('Please enter a valid number for the balance.');
      return;
    }

    const newAccount = {
      accountType,
      balance,
    };

    try {
      const response = await axios.post('/api/create_account', newAccount); // Send a POST request to the server
      if (response.status === 200) {
        alert('Account created successfully!');
        setAccountType('');
        setBalance('');
        setErrorMessage(''); // Clear any error messages
      }
    } catch (error) {
      console.error('There was an error creating the account!', error);
    }
  };

  // Handle balance input
  const handleBalanceChange = (e) => {
    const value = e.target.value;

    // Check if the value contains only digits or is empty
    if (/^\d*$/.test(value)) {
      setBalance(value);
      setErrorMessage(''); // Clear the error message if input is valid
    } else {
      setErrorMessage('Please Enter A Number'); // Set an error message for invalid input
    }
  };

  return (
    <div>
      <h1>Create New Account</h1>
      <form onSubmit={createAccount}>
        <div>
          <label>Account Type:</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            required
          >
            <option value="" disabled>Select Account Type</option>
            <option value="Debit">Debit</option>
            <option value="Saving">Saving</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label>Balance:</label>
          <input
            type="text"
            value={balance}
            onChange={handleBalanceChange} // Use the custom change handler
            required
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message if present */}
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default CreateAccount;