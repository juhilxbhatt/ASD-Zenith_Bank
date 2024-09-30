import React, { useState } from 'react';
import axios from 'axios';

const TransferDeposit = ({ userId }) => {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('transfer');

  const handleTransaction = async () => {
    const endpoint = operation === 'transfer' ? '/api/transfer' : '/api/deposit';
    const data = { user_id: userId, amount };

    if (operation === 'transfer') {
      data.recipient_id = recipientId;
    }

    try {
      const response = await axios.post(endpoint, data);
      alert(response.data.message);
    } catch (error) {
      console.error('Error making transaction:', error);
    }
  };

  return (
    <div>
      <h2>Transfer & Deposit</h2>

      <label>
        Operation:
        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="transfer">Transfer</option>
          <option value="deposit">Deposit</option>
        </select>
      </label>

      {operation === 'transfer' && (
        <div>
          <label>
            Recipient ID:
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
          </label>
        </div>
      )}

      <label>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <button onClick={handleTransaction}>
        {operation === 'transfer' ? 'Transfer' : 'Deposit'}
      </button>
    </div>
  );
};

export default TransferDeposit;
