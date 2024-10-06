import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Home from './Home';
import CreateAccount from './CreateAccount';
import TransactionLogs from './TransactionLogs';
import MonthlyStatement from './MonthlyStatement';
import TransferDeposit from './TransferDeposit';
import BankStatement from './BankStatement';
import LoginPage from './LoginPage';
import CreateUser from './CreateUser';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/TransactionLogs" element={<TransactionLogs />} />
              <Route path="/MonthlyStatement" element={<MonthlyStatement />} />
              <Route path="/TransferDeposit" element={<TransferDeposit />} />
              <Route path="/BankStatement" element={<BankStatement />} />
              <Route path="/login-page" element={<LoginPage />} />
              <Route path="/create-user" element={<CreateUser />} />
            </Routes>
          </div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;