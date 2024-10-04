import React, { useState } from 'react';
import axios from 'axios';

function CreateAccount() {
  const [accountType, setAccountType] = useState('');
  const [balance, setBalance] = useState('');

  const createAccount = async (e) => {
    e.preventDefault();
    
    const newAccount = {
      accountType,
      balance,
    };

    try {
      const response = await axios.post('/api/create_account', newAccount); // Send a POST request to the server
      if (response.status === 200) {
        alert('Account created successfully!');
      }
    } catch (error) {
      console.error('There was an error creating the account!', error);
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
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default CreateAccount;