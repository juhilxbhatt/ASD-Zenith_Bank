// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import TransactionLogs from './components/TransactionLogs';
import MonthlyStatement from './components/MonthlyStatement';
import TransferDeposit from './components/TransferDeposit';
import BankStatement from './components/BankStatement';
import LoginPage from './components/LoginPage';
import CreateUser from './components/CreateUser';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import AddPayee from './components/AddPayee';
import SchedulePayment from './components/SchedulePayment';
import ViewPayees from './components/ViewPayees';
import ViewScheduledPayments from './components/ViewScheduledPayments';


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

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Protected Routes */}

            {/* Public Routes */}
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/transactionLogs" element={<TransactionLogs />} />
            <Route path="/login-page" element={<LoginPage />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/" element={<Home />} />"
            <Route path="/monthly-statement" element={<MonthlyStatement />} />
            <Route path="/transfer-deposit" element={<TransferDeposit />} />
            <Route path="/add-payee" element={<AddPayee />} />
            <Route path="/schedule-payment" element={<SchedulePayment />} />
            <Route path="/view-payees" element={<ViewPayees />} />
            <Route path="/view-scheduled-payments" element={<ViewScheduledPayments />} />
            <Route path="/BankStatement" element={<BankStatement />} />
        </Routes>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthProvider>
                    <Router>
                        <div className="App">
                            <AppRoutes />
                        </div>
                    </Router>
                </AuthProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default App;