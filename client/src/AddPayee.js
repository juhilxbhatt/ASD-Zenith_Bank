import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie'; 
// import './App.css';

function AddPayee() {
  //Stores the data from the form
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBSB, setAccountBSB] = useState('');
  const [error, setError] = useState('');

  //Creates the newPayee
  const newPayee = async (e) => {
    e.preventDefault();

    // const userId = Cookies.get(); //Gets the user ID from the cookie
    
    const newPayee = {
      userId,
      firstName,
      lastName,
      bankName, 
      accountNumber,
      accountBSB,
    };
    //Exception handling
    try {
      const response = await axios.post('/api/new_payee', newPayee);
      if (response.status === 200) {
        alert('Payee successfully added!');
        navigate(-1)
      }
    } catch (error) {
      console.error('Invalid information entered', error);
    }

  };

  const handleBack = () => {//Goes to the page before
    navigate(-1);
  };


  return (
  //   Add new payee information
    <div> 
      <h1>Add New Payee</h1>
      <form onSubmit={newPayee}>
        <div>
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
        </div>
        <div>
          <label>Bank Name:</label>
          <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required/>
          <label>Account Number:</label>
          <input type="number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required/>
          <label>Account BSB:</label>
          <input type="number" value={accountBSB} onChange={(e) => setAccountBSB(e.target.value)} required/>
        </div>
        <button type="button" onClick={handleBack}>Back</button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddPayee;