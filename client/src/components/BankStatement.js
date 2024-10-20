import React, { useEffect, useState, useRef } from 'react';
import { Box, Container, Typography, Button, CircularProgress, TextField } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function BankStatement() {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data for charts
  const [monthlySpending, setMonthlySpending] = useState({});
  const [deposits, setDeposits] = useState({});
  const [withdrawals, setWithdrawals] = useState({});
  
  // State to manage chart visibility
  const [chartsVisible, setChartsVisible] = useState(false);

  // State for account details
  const [accountDetails, setAccountDetails] = useState([]);

  // Reference to the component for PDF generation
  const pdfRef = useRef();

  // Function to fetch transaction logs
  const fetchTransactionLogs = (startDate = '', endDate = '') => {
    setLoading(true);
    let url = '/api/transaction_logs';

    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStatementData(data);
          categorizeTransactions(data.TransactionLogs); // Categorize transactions for charts
          fetchAccountDetails(data.Accounts); // Fetch account details
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data.");
        setLoading(false);
      });
  };

  // Fetch account details from the new API route
  const fetchAccountDetails = (accounts) => {
    const accountIds = accounts.map(account => account._id);
    
    fetch(`/api/account_details?account_ids=${accountIds.join('&account_ids=')}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setAccountDetails(data);
        }
      })
      .catch(err => {
        setError("Failed to fetch account details.");
      });
  };

  const categorizeTransactions = (logs) => {
    const depositsData = [];
    const withdrawalsData = [];
    const spendingData = {};

    logs.forEach((log) => {
      const logDate = new Date(log.Date);
      const month = logDate.toLocaleString('default', { month: 'long' });

      if (!spendingData[month]) {
        spendingData[month] = 0;
      }

      if (log.Amount > 0) {
        depositsData.push(log.Amount);
      } else {
        withdrawalsData.push(Math.abs(log.Amount)); // Store withdrawals as positive values
      }

      // Accumulate spending by month
      spendingData[month] += Math.abs(log.Amount);
    });

    setDeposits({
      labels: depositsData.map((_, idx) => `Transaction ${idx + 1}`),
      datasets: [
        {
          label: 'Deposits',
          data: depositsData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });

    setWithdrawals({
      labels: withdrawalsData.map((_, idx) => `Transaction ${idx + 1}`),
      datasets: [
        {
          label: 'Withdrawals',
          data: withdrawalsData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });

    setMonthlySpending({
      labels: Object.keys(spendingData),
      datasets: [
        {
          label: 'Monthly Spending',
          data: Object.values(spendingData),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Initial fetch of all transaction logs
  useEffect(() => {
    fetchTransactionLogs();
  }, []);

  // Handler for date filters
  const handleFilter = () => {
    if (startDate && endDate) {
      fetchTransactionLogs(startDate, endDate);
    } else {
      alert("Please select both start and end dates.");
    }
  };

  // Helper function to filter transaction logs by date
  const filterLogsByDate = (logs, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return logs.filter(log => {
      const logDate = new Date(log.Date);
      return logDate >= start && logDate <= end;
    });
  };

  // Toggle charts visibility
  const toggleChartsVisibility = () => {
    setChartsVisible((prev) => !prev);
  };

  // Function to download the page as a PDF
  const downloadPDF = () => {
    const input = pdfRef.current;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; // Adjust width as needed
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add the image to PDF
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('bank_statement.pdf');
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        minHeight: '100vh',
        py: 10,
        color: '#fff',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          Bank Statement
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={3}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button variant="contained" color="primary" onClick={handleFilter}>
            Filter
          </Button>
        </Box>

        <Box ref={pdfRef}>
          <Typography variant="h5" align="center" gutterBottom>
            Account Details
          </Typography>

          {accountDetails.length > 0 && accountDetails.map((account) => (
            <Box
              key={account.id}
              sx={{
                backgroundColor: '#fff',
                color: '#000',
                borderRadius: '10px',
                p: 3,
                boxShadow: 4,
                mb: 4,
              }}
            >
              <Typography variant="h6">
                <strong>Account ID:</strong> {account.id}
              </Typography>
              <Typography variant="h6">
                <strong>User ID:</strong> {account.userID}
              </Typography>
              <Typography variant="h6">
                <strong>Account Type:</strong> {account.accountType}
              </Typography>
              <Typography variant="h6">
                <strong>Balance:</strong> ${account.balance}
              </Typography>
              <Typography variant="h6">
                <strong>Status:</strong> {account.status}
              </Typography>

              {/* Display transaction logs for each account with date filter */}
              <Typography variant="h6" sx={{ mt: 3 }}>
                <strong>Transaction Logs:</strong>
              </Typography>
              <Box sx={{ maxHeight: '200px', overflowY: 'auto', mt: 2 }}>
                {statementData?.TransactionLogs.filter(log => 
                  log.AccountID === account.id && 
                  (!startDate || !endDate || 
                  (new Date(log.Date) >= new Date(startDate) && new Date(log.Date) <= new Date(endDate)))
                ).length > 0 ? (
                  <ul>
                    {statementData.TransactionLogs.filter(log => 
                      log.AccountID === account.id && 
                      (!startDate || !endDate || 
                      (new Date(log.Date) >= new Date(startDate) && new Date(log.Date) <= new Date(endDate)))
                    ).map((log, index) => (
                      <li key={index}>
                        <Typography variant="body1">
                          <strong>Date:</strong> {new Date(log.Date).toLocaleDateString()} | 
                          <strong> Amount:</strong> ${log.Amount} | 
                          <strong> Type:</strong> {log.Amount > 0 ? 'Deposit' : 'Withdrawal'}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body2">No transactions available for this account.</Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {chartsVisible && (
          <Box sx={{
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            p: 3,
            boxShadow: 4,
            mb: 4,
          }}>
            <Typography variant="h5" align="center" gutterBottom>
              Charts
            </Typography>
              <Bar data={deposits} options={{ responsive: true }} />
              <Bar data={withdrawals} options={{ responsive: true }} />
            <Line data={monthlySpending} options={{ responsive: true }} />
          </Box>
        )}

        <Button variant="contained" color="primary" onClick={toggleChartsVisibility}>
          {chartsVisible ? 'Hide Charts' : 'Show Charts'}
        </Button>
        <Button variant="contained" color="secondary" onClick={downloadPDF} sx={{ ml: 2 }}>
          Download PDF
        </Button>
      </Container>
    </Box>
  );
}

export default BankStatement;