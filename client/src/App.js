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
            <Route path="/" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Home />
                </ProtectedRoute>
            } />
            <Route path="/transaction-logs" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <TransactionLogs />
                </ProtectedRoute>
            } />
            <Route path="/monthly-statement" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <MonthlyStatement />
                </ProtectedRoute>
            } />
            <Route path="/transfer-deposit" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <TransferDeposit />
                </ProtectedRoute>
            } />
            <Route path="/bank-statement" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <BankStatement />
                </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/login-page" element={<LoginPage />} />
            <Route path="/create-user" element={<CreateUser />} />
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