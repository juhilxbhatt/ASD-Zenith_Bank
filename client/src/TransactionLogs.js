import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function TransactionLogs() {
  const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]); // State to hold accounts

  useEffect(() => {
    // Fetch transaction logs from the backend
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/transaction_logs');
        console.log("Response from API:", response.data); // Log the response

        // Check if TransactionLogs exists in the response data
        if (response.data.TransactionLogs) {
          const logs = response.data.TransactionLogs;

          // Group logs by AccountID
          const grouped = logs.reduce((acc, log) => {
            const accountId = log.AccountID;
            if (!acc[accountId]) acc[accountId] = [];
            acc[accountId].push(log);
            return acc;
          }, {});

          console.log("Grouped Logs:", grouped); // Log the grouped logs
          setGroupedLogs(grouped); // Set the grouped logs
        }

        // Store the accounts in state
        setAccounts(response.data.Accounts);
      } catch (error) {
        console.error('Error fetching transaction logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const handleAccountSelect = (accountId) => {
    setSelectedAccount(accountId);
  };

  // Get a list of all account IDs
  const accountIds = accounts.map(account => account._id.toString()); // Make sure to convert ObjectId to string

  return (
    <div className="transaction-logs">
      <h1>Transaction Logs</h1>

      {/* Account selection */}
      {accountIds.length > 0 ? (
        <div className="account-selector">
          <h2>Select Account</h2>
          <ul>
            {accountIds.map((accountId) => (
              <li key={accountId}>
                <button onClick={() => handleAccountSelect(accountId)}>
                  View Transactions for Account {accountId}
                </button>
                {/* Indicate if there are no transactions */}
                {groupedLogs[accountId] && groupedLogs[accountId].length === 0 && (
                  <span style={{ color: 'red' }}> (No transactions available)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No accounts available.</p>
      )}

      {/* Transaction logs for the selected account */}
      {selectedAccount && groupedLogs[selectedAccount] !== undefined ? (
        <div className="logs-list">
          <h2>Transactions for Account {selectedAccount}</h2>
          {groupedLogs[selectedAccount] && groupedLogs[selectedAccount].length > 0 ? (
            <ul>
              {groupedLogs[selectedAccount].map((log, index) => (
                <li key={index} className="log-item">
                  <div className="log-inline">
                    <p><strong>Amount:</strong> ${log.Amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> {new Date(log.Date).toLocaleDateString()}</p>
                  </div>
                  <p><strong>Description:</strong> {log.Description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions for this account.</p> // Message when no transactions exist
          )}
        </div>
      ) : (
        selectedAccount && <p>No transactions for this account.</p>
      )}
    </div>
  );
}

export default TransactionLogs;