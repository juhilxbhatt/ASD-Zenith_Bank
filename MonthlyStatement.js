import React, { useState } from 'react';
import axios from 'axios';

const MonthlyStatement = ({ userId }) => {
  const [month, setMonth] = useState('');
  const [transactions, setTransactions] = useState([]);

  const fetchStatement = async () => {
    try {
      const response = await axios.get(`/api/statement/${userId}?month=${month}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching statement:', error);
    }
  };

  return (
    <div>
      <h2>Monthly Bank Statement</h2>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="">Select Month</option>
        <option value="01">January</option>
        <option value="02">February</option>
        {/* Add other months */}
      </select>
      <button onClick={fetchStatement}>View Statement</button>

      {transactions.length > 0 && (
        <ul>
          {transactions.map((txn, index) => (
            <li key={index}>
              {txn.type} - ${txn.amount} on {txn.date} ({txn.category})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MonthlyStatement;