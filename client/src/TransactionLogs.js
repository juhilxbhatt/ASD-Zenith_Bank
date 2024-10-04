import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function TransactionLogs() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    // Fetch transaction logs from the backend
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/transaction_logs');
        // Sort the logs by date in descending order
        const sortedLogs = response.data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        setLogs(sortedLogs);
      } catch (error) {
        console.error('Error fetching transaction logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const handleLogClick = (log) => {
    setSelectedLog(log === selectedLog ? null : log); // Toggle log details
  };

  return (
    <div className="transaction-logs">
      <h1>Transaction Logs</h1>
      <ul className="logs-list">
        {logs.map((log, index) => (
          <li key={index} className="log-item" onClick={() => handleLogClick(log)}>
            <div className="log-inline">
              <p><strong>Amount:</strong> ${log.Amount}</p>
              <p><strong>Date:</strong> {new Date(log.Date).toLocaleDateString()}</p>
            </div>

            {/* Display more details if this log is selected */}
            {selectedLog === log && (
              <div className="log-details">
                <p><strong>Description:</strong> {log.Description}</p>
                <p><strong>Category:</strong> {log.CategoryID}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionLogs;